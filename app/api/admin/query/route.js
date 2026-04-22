import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Product from '../../../../lib/models/Product';
import Order from '../../../../lib/models/Order';
import User from '../../../../lib/models/User';
import Category from '../../../../lib/models/Category';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');

  const collections = {
    products: Product,
    orders: Order,
    users: User,
    categories: Category,
  };

  if (!collection || !collections[collection]) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    await dbConnect();
    const Model = collections[collection];
    const data = await Model.find({}).limit(100);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request) {
  const { collection, filter } = await request.json();

  const collections = {
    products: Product,
    orders: Order,
    users: User,
    categories: Category,
  };

  if (!collection || !collections[collection]) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    await dbConnect();
    const Model = collections[collection];
    const data = await Model.find(filter || {}).limit(100);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
