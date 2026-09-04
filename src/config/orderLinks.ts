export interface OrderPlatform {
    name: string;
    description: string;
    href: string;
  }
  
  export const orderPlatforms: OrderPlatform[] = [
    {
      name: "Deliveroo",
      description:
        "Order your Cafe Two Shades favourites for delivery.",
      href: "TODO_DELIVEROO_URL",
    },
    {
      name: "Uber Eats",
      description:
        "Find Cafe Two Shades on Uber Eats and place your order.",
      href: "TODO_UBER_EATS_URL",
    },
    {
      name: "Just Eat",
      description:
        "Order from Cafe Two Shades through Just Eat.",
      href: "TODO_JUST_EAT_URL",
    },
  ];