import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ReviewModel from "@/models/Review.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 🔐 Authenticate admin
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    // 🔌 Connect DB
    await connectDB();

    // 🔎 Parse query params
    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);

    let filters = [];
    try {
      filters = JSON.parse(searchParams.get("filters") || "[]");
    } catch {}

    const globalFilter = searchParams.get("globalFilter") || "";

    let sorting = [];
    try {
      sorting = JSON.parse(searchParams.get("sorting") || "[]");
    } catch {}

    const deleteType = searchParams.get("deleteType");

    // 🧠 Build base match query
    let matchQuery = {};
    if (deleteType === "SD") {
      matchQuery.deletedAt = null;
    } else if (deleteType === "PD") {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null;
    }

    // 🌍 Global search
    if (globalFilter) {
      matchQuery.$or = [
        { "productData.title": { $regex: globalFilter, $options: "i" } },
        { "user.name": { $regex: globalFilter, $options: "i" } },
        { rating: { $regex: globalFilter, $options: "i" } },
        { review: { $regex: globalFilter, $options: "i" } },
      ];

      // Boolean search
      if (globalFilter === "true" || globalFilter === "false") {
        matchQuery.$or.push({isEmailVerified: globalFilter === "true",
        });
      }
    }

    // 📊 Column filters
    filters.forEach(filter => {
      if (filter.id === 'product') {
         matchQuery['productData.title'] = {$regex: filter.value, $options: "i"}
      }else if (filter.id === 'user') {
            matchQuery['userData.name'] = {$regex: filter.value, $options: "i"}
      } else {
         matchQuery[filter.id] = {$regex: filter.value, $options: "i",}
      }
    });


    // ↕️ Sorting
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((sort) => {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      });
    }

    // 📦 Aggregation
    const getReview = await ReviewModel.aggregate([
      {
        $lookup:{
          from:'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $unwind: {path: '$productData', preserveNullAndEmptyArrays: true}
      },
      {
        $lookup:{
          from:'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: {path: '$userData', preserveNullAndEmptyArrays: true}
      },
      { $match: matchQuery },
      { $sort: sortQuery },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          product: '$productData',
          user: '$userData',
          rating: 1,
          review: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ]);

    // 🔢 Total count
    const totalRowCount = await ReviewModel.countDocuments(matchQuery);

    // ✅ Response
    return NextResponse.json({
      success: true,
      data: getReview,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
