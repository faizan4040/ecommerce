
import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";


export async function GET(request) {
  try {
    // 🔐 Admin auth
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    // 🔌 DB
    await connectDB();

    // 🔍 Params
    const { searchParams } = new URL(request.url);

    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const globalFilter = searchParams.get("globalFilter") || "";
    const deleteType = searchParams.get("deleteType");

    let filters = [];
    let sorting = [];

    try {
      filters = JSON.parse(searchParams.get("filters") || "[]");
      sorting = JSON.parse(searchParams.get("sorting") || "[]");
    } catch {}

    // 🧠 MATCH QUERY
    let matchQuery = {
      deletedAt: deleteType === "PD" ? { $ne: null } : null,
    };

    // 🌍 Global search
    if (globalFilter) {
      matchQuery.$or = [
        { order_id: new RegExp(globalFilter, "i") },
        { payment_id: new RegExp(globalFilter, "i") },
        { name: new RegExp(globalFilter, "i") },
        { email: new RegExp(globalFilter, "i") },
        { phone: new RegExp(globalFilter, "i") },
        { status: new RegExp(globalFilter, "i") },
      ];
    }

    // 📊 Column filters
    filters.forEach((f) => {
      matchQuery[f.id] = new RegExp(f.value, "i");
    });

    // 🔃 Sorting
    let sortQuery = { createdAt: -1 };
    if (sorting.length) {
      sortQuery = {};
      sorting.forEach((s) => {
        sortQuery[s.id] = s.desc ? -1 : 1;
      });
    }

    // ✅ FETCH ORDERS WITH PRODUCT IMAGE
        const orders = await OrderModel.find(matchQuery)
        .sort(sortQuery)
        .skip(start)
        .limit(size)
        .populate({
            path: "products.productId",
            select: "name slug",
        })
        .populate({
            path: "products.variantId",
            populate: {
            path: "media",
            select: "url",
            },
        })
        .lean();

    // 🔢 Count
    const totalRowCount = await OrderModel.countDocuments(matchQuery);

    // ✅ Response
    return NextResponse.json({
      success: true,
      data: orders,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("ORDERS API ERROR:", error);
    return catchError(error);
  }
}









// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import OrderModel from "@/models/Order.model";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     // 🔐 Authenticate admin
//     const auth = await isAuthenticated("admin");
//     if (!auth.isAuth) {
//       return response(false, 403, "Unauthorized");
//     }

//     // 🔌 Connect DB
//     await connectDB();

//     // 🔍 Read query params
//     const { searchParams } = new URL(request.url);

//     const start = parseInt(searchParams.get("start") || "0", 10);
//     const size = parseInt(searchParams.get("size") || "10", 10);

//     const globalFilter = searchParams.get("globalFilter") || "";
//     const deleteType = searchParams.get("deleteType");

//     let filters = [];
//     let sorting = [];

//     try {
//       filters = JSON.parse(searchParams.get("filters") || "[]");
//     } catch {}

//     try {
//       sorting = JSON.parse(searchParams.get("sorting") || "[]");
//     } catch {}

//     // 🧠 MATCH QUERY
//     let matchQuery = {};

//     // Soft delete logic
//     if (deleteType === "PD") {
//       matchQuery.deletedAt = { $ne: null };
//     } else {
//       matchQuery.deletedAt = null; // default → show active
//     }

//     // 🌍 Global search
//     if (globalFilter) {
//       matchQuery.$or = [
//         { order_id: { $regex: globalFilter, $options: "i" } },
//         { payment_id: { $regex: globalFilter, $options: "i" } },
//         { name: { $regex: globalFilter, $options: "i" } },
//         { email: { $regex: globalFilter, $options: "i" } },
//         { phone: { $regex: globalFilter, $options: "i" } },
//         { status: { $regex: globalFilter, $options: "i" } },
//       ];
//     }

//     // 📊 Column filters
//     filters.forEach((filter) => {
//       matchQuery[filter.id] = {
//         $regex: filter.value,
//         $options: "i",
//       };
//     });

//     // 🔃 Sorting
//     let sortQuery = { createdAt: -1 };
//     if (sorting.length) {
//       sortQuery = {};
//       sorting.forEach((sort) => {
//         sortQuery[sort.id] = sort.desc ? -1 : 1;
//       });
//     }

//     // 🚀 Aggregation pipeline
//     const orders = await OrderModel.aggregate([
//       { $match: matchQuery },
//       { $sort: sortQuery },
//       { $skip: start },
//       { $limit: size },
//     ]);

//     // 🔢 Total count (for pagination)
//     const totalRowCount = await OrderModel.countDocuments(matchQuery);

//     // ✅ Response
//     return NextResponse.json({
//       success: true,
//       data: orders,
//       meta: {
//         totalRowCount,
//       },
//     });
//   } catch (error) {
//     console.error("ORDERS API ERROR:", error);
//     return catchError(error);
//   }
// }















