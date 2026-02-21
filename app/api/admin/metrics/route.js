import { dbConnect } from "../../../../lib/dbConnect";
import Product from "../../../../lib/models/Product";
import Order from "../../../../lib/models/Order";
import User from "../../../../lib/models/User";

export async function GET() {
  try {
    await dbConnect();

    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments();

    // Build sales totals per product, including products with zero sales
    const sales = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.productId", "$$productId"] } } },
            { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } }
          ],
          as: "sales"
        }
      },
      { $addFields: { totalSold: { $ifNull: [{ $arrayElemAt: ["$sales.totalSold", 0] }, 0] } } },
      { $project: { name: 1, image: 1, totalSold: 1 } },
      { $sort: { totalSold: -1 } }
    ]);

    const topSelling = sales.length
      ? { productId: sales[0]._id, name: sales[0].name, image: sales[0].image || null, totalSold: sales[0].totalSold }
      : null;

    const leastSelling = sales.length
      ? { productId: sales[sales.length - 1]._id, name: sales[sales.length - 1].name, image: sales[sales.length - 1].image || null, totalSold: sales[sales.length - 1].totalSold }
      : null;

    const payload = { productsCount, ordersCount, usersCount, topSelling, leastSelling };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
