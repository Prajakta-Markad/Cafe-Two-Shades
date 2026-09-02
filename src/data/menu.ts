export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  displayOrder: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "english-breakfast",
    name: "English Breakfast",
    displayOrder: 1,
    items: [],
  },
  {
    id: "panini-with-crisp",
    name: "Panini With Crisp",
    displayOrder: 2,
    items: [],
  },
  {
    id: "egg-mania",
    name: "Egg Mania",
    displayOrder: 3,
    items: [],
  },
  {
    id: "sandwich-with-crisp",
    name: "Sandwich With Crisp",
    displayOrder: 4,
    items: [],
  },
  {
    id: "wraps-with-fries",
    name: "Wraps With Fries",
    displayOrder: 5,
    items: [],
  },
  {
    id: "kids-special",
    name: "Kids Special",
    displayOrder: 6,
    items: [],
  },
  {
    id: "street-food",
    name: "Street Food",
    displayOrder: 7,
    items: [],
  },
  {
    id: "speciality-chips",
    name: "Speciality Chips",
    displayOrder: 8,
    items: [],
  },
  {
    id: "nutella-bubble-waffles",
    name: "Nutella Bubble Waffles",
    displayOrder: 9,
    items: [],
  },
  {
    id: "waffle-lolly",
    name: "Waffle Lolly",
    displayOrder: 10,
    items: [],
  },
  {
    id: "american-waffles",
    name: "American Waffles",
    displayOrder: 11,
    items: [],
  },
  {
    id: "sundae",
    name: "Sundae",
    displayOrder: 12,
    items: [],
  },
  {
    id: "twoshades-special",
    name: "TwoShades Special",
    displayOrder: 13,
    items: [],
  },
  {
    id: "shakes",
    name: "Shakes",
    displayOrder: 14,
    items: [],
  },
  {
    id: "cakes",
    name: "Cakes",
    displayOrder: 15,
    items: [],
  },
  {
    id: "italian-gelato-sorbets",
    name: "Italian Gelato & Sorbets",
    displayOrder: 16,
    items: [],
  },
  {
    id: "coffee-and-drinks",
    name: "Coffee And Drinks",
    displayOrder: 17,
    items: [],
  },
  {
    id: "special-dessert",
    name: "Special Dessert",
    displayOrder: 18,
    items: [],
  },
  {
    id: "soft-drinks",
    name: "Soft Drinks",
    displayOrder: 19,
    items: [],
  },
  {
    id: "twoshades-special-chai",
    name: "TwoShades Special Chai",
    displayOrder: 20,
    items: [],
  },
  {
    id: "create-your-own-meal",
    name: "Create Your Own Meal",
    displayOrder: 21,
    items: [],
  },
];