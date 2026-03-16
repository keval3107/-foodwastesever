export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate: string;
  warehouse: string;
  dailySalesAvg: number;
  imageUrl?: string;
}

export const categories = [
  "Dairy", "Bakery", "Vegetables", "Fruits", "Ready-to-eat", "Beverages", "Snacks"
];

export const warehouses = ["Warehouse A", "Warehouse B", "Warehouse C"];

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const imageFor = (query: string) => `https://source.unsplash.com/featured/400x300?${encodeURIComponent(query)}`;

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Amul Toned Milk 1L",
    category: "Dairy",
    quantity: 120,
    price: 54,
    expiryDate: addDays(1),
    warehouse: "Warehouse A",
    dailySalesAvg: 45,
    imageUrl: imageFor("milk"),
  },
  {
    id: "2",
    name: "Epigamia Greek Yogurt 400g",
    category: "Dairy",
    quantity: 80,
    price: 89,
    expiryDate: addDays(2),
    warehouse: "Warehouse A",
    dailySalesAvg: 20,
    imageUrl: imageFor("yogurt"),
  },
  {
    id: "3",
    name: "Harvest Gold Bread Loaf",
    category: "Bakery",
    quantity: 200,
    price: 42,
    expiryDate: addDays(1),
    warehouse: "Warehouse B",
    dailySalesAvg: 70,
    imageUrl: imageFor("bread"),
  },
  {
    id: "4",
    name: "Theobroma Sourdough 400g",
    category: "Bakery",
    quantity: 50,
    price: 165,
    expiryDate: addDays(3),
    warehouse: "Warehouse B",
    dailySalesAvg: 12,
    imageUrl: imageFor("sourdough"),
  },
  {
    id: "5",
    name: "Fresh Palak (Spinach) 250g",
    category: "Vegetables",
    quantity: 90,
    price: 30,
    expiryDate: addDays(2),
    warehouse: "Warehouse C",
    dailySalesAvg: 30,
    imageUrl: imageFor("spinach"),
  },
  {
    id: "6",
    name: "Cherry Tomatoes 250g",
    category: "Vegetables",
    quantity: 150,
    price: 60,
    expiryDate: addDays(4),
    warehouse: "Warehouse A",
    dailySalesAvg: 40,
    imageUrl: imageFor("cherry tomatoes"),
  },
  {
    id: "7",
    name: "Baby Carrots 300g",
    category: "Vegetables",
    quantity: 110,
    price: 45,
    expiryDate: addDays(7),
    warehouse: "Warehouse C",
    dailySalesAvg: 25,
    imageUrl: imageFor("carrots"),
  },
  {
    id: "8",
    name: "Strawberries 200g",
    category: "Fruits",
    quantity: 60,
    price: 120,
    expiryDate: addDays(1),
    warehouse: "Warehouse A",
    dailySalesAvg: 25,
    imageUrl: imageFor("strawberries"),
  },
  {
    id: "9",
    name: "Robusta Bananas 1 dozen",
    category: "Fruits",
    quantity: 300,
    price: 49,
    expiryDate: addDays(3),
    warehouse: "Warehouse B",
    dailySalesAvg: 80,
    imageUrl: imageFor("bananas"),
  },
  {
    id: "10",
    name: "Hass Avocado (3 pack)",
    category: "Fruits",
    quantity: 45,
    price: 249,
    expiryDate: addDays(2),
    warehouse: "Warehouse A",
    dailySalesAvg: 15,
    imageUrl: imageFor("avocado"),
  },
  {
    id: "11",
    name: "Chicken Caesar Wrap",
    category: "Ready-to-eat",
    quantity: 30,
    price: 189,
    expiryDate: addDays(1),
    warehouse: "Warehouse B",
    dailySalesAvg: 18,
    imageUrl: imageFor("chicken wrap"),
  },
  {
    id: "12",
    name: "Veggie Sushi Box (8 pcs)",
    category: "Ready-to-eat",
    quantity: 25,
    price: 299,
    expiryDate: addDays(1),
    warehouse: "Warehouse A",
    dailySalesAvg: 10,
    imageUrl: imageFor("sushi"),
  },
  {
    id: "13",
    name: "Pasta Salad 350g",
    category: "Ready-to-eat",
    quantity: 40,
    price: 149,
    expiryDate: addDays(3),
    warehouse: "Warehouse C",
    dailySalesAvg: 12,
    imageUrl: imageFor("pasta salad"),
  },
  {
    id: "14",
    name: "Tropicana Orange Juice 1L",
    category: "Beverages",
    quantity: 180,
    price: 120,
    expiryDate: addDays(8),
    warehouse: "Warehouse A",
    dailySalesAvg: 35,
    imageUrl: imageFor("orange juice"),
  },
  {
    id: "15",
    name: "Epigamia Almond Milk 1L",
    category: "Beverages",
    quantity: 95,
    price: 199,
    expiryDate: addDays(10),
    warehouse: "Warehouse B",
    dailySalesAvg: 18,
    imageUrl: imageFor("almond milk"),
  },
  {
    id: "16",
    name: "Mixed Berry Smoothie 300ml",
    category: "Beverages",
    quantity: 35,
    price: 129,
    expiryDate: addDays(2),
    warehouse: "Warehouse C",
    dailySalesAvg: 12,
    imageUrl: imageFor("berry smoothie"),
  },
  {
    id: "17",
    name: "Wingreens Hummus 200g",
    category: "Snacks",
    quantity: 70,
    price: 179,
    expiryDate: addDays(5),
    warehouse: "Warehouse A",
    dailySalesAvg: 15,
    imageUrl: imageFor("hummus"),
  },
  {
    id: "18",
    name: "Amul Cheddar Cheese 200g",
    category: "Dairy",
    quantity: 85,
    price: 145,
    expiryDate: addDays(6),
    warehouse: "Warehouse B",
    dailySalesAvg: 20,
    imageUrl: imageFor("cheese"),
  },
  {
    id: "19",
    name: "Blueberries 125g",
    category: "Fruits",
    quantity: 55,
    price: 199,
    expiryDate: addDays(4),
    warehouse: "Warehouse C",
    dailySalesAvg: 18,
    imageUrl: imageFor("blueberries"),
  },
  {
    id: "20",
    name: "Egg Fried Rice 400g",
    category: "Ready-to-eat",
    quantity: 65,
    price: 159,
    expiryDate: addDays(2),
    warehouse: "Warehouse A",
    dailySalesAvg: 22,
    imageUrl: imageFor("fried rice"),
  },
];
