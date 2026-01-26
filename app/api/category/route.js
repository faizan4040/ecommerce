import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const searchParams = request.nextUrl.searchParams;

    // Query params
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    // Match query
    let matchQuery = {};

    // 🔥 IMPORTANT FIX
    if (deleteType === "SD") {
      matchQuery.$or = [
        { deletedAt: null },
        { deletedAt: { $exists: false } },
      ];
    } else if (deleteType === "PD") {
      matchQuery.deletedAt = { $ne: null };
    }

    // Global search
    if (globalFilter) {
      matchQuery.$and = matchQuery.$and || [];
      matchQuery.$and.push({
        $or: [
          { name: { $regex: globalFilter, $options: "i" } },
          { slug: { $regex: globalFilter, $options: "i" } },
        ],
      });
    }

    // Column filters
    filters.forEach((filter) => {
      matchQuery[filter.id] = {
        $regex: filter.value,
        $options: "i",
      };
    });

    // Sorting
    let sortQuery = {};
    sorting.forEach((sort) => {
      sortQuery[sort.id] = sort.desc ? -1 : 1;
    });

    // Aggregation pipeline
    const aggregatePipeline = [
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];

    const data = await CategoryModel.aggregate(aggregatePipeline);
    const totalRowCount = await CategoryModel.countDocuments(matchQuery);

    return NextResponse.json({
      data,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
