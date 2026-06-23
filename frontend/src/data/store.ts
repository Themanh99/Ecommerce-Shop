export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  discount?: number;
  image: string;
  colors: string[];
};

export const products: Product[] = [
  {
    id: 'gradient-graphic-tshirt',
    name: 'Gradient Graphic T-shirt',
    category: 'T-shirts',
    price: 145,
    rating: 4.5,
    image:
      '/images/store/product-1.jpg',
    colors: ['#4f4631', '#314f4a', '#263447'],
  },
  {
    id: 'polo-tipping-details',
    name: 'Polo with Tipping Details',
    category: 'Shirts',
    price: 180,
    rating: 4.5,
    image:
      '/images/store/product-2.jpg',
    colors: ['#9f5868', '#40566f', '#f0e5d1'],
  },
  {
    id: 'black-striped-tshirt',
    name: 'Black Striped T-shirt',
    category: 'T-shirts',
    price: 120,
    oldPrice: 150,
    rating: 5,
    discount: 20,
    image:
      '/images/store/product-3.jpg',
    colors: ['#151515', '#e7e7e7'],
  },
  {
    id: 'skinny-fit-jeans',
    name: 'Skinny Fit Jeans',
    category: 'Jeans',
    price: 240,
    oldPrice: 260,
    rating: 3.5,
    discount: 8,
    image:
      '/images/store/product-4.jpg',
    colors: ['#304c70', '#1e2e43'],
  },
  {
    id: 'vertical-striped-shirt',
    name: 'Vertical Striped Shirt',
    category: 'Shirts',
    price: 212,
    oldPrice: 232,
    rating: 5,
    discount: 9,
    image:
      '/images/store/product-5.jpg',
    colors: ['#75806f', '#e9e3d7'],
  },
  {
    id: 'courage-graphic-tshirt',
    name: 'Courage Graphic T-shirt',
    category: 'T-shirts',
    price: 145,
    rating: 4,
    image:
      '/images/store/product-6.jpg',
    colors: ['#dd632f', '#e6c6aa'],
  },
  {
    id: 'loose-fit-bermuda-shorts',
    name: 'Loose Fit Bermuda Shorts',
    category: 'Shorts',
    price: 80,
    rating: 3,
    image:
      '/images/store/product-7.jpg',
    colors: ['#4e6677', '#d1c7b6'],
  },
  {
    id: 'faded-skinny-jeans',
    name: 'Faded Skinny Jeans',
    category: 'Jeans',
    price: 210,
    rating: 4.5,
    image:
      '/images/store/product-8.jpg',
    colors: ['#252525', '#607488'],
  },
  {
    id: 'checkered-shirt',
    name: 'Checkered Shirt',
    category: 'Shirts',
    price: 180,
    rating: 4.5,
    image:
      '/images/store/product-9.jpg',
    colors: ['#813c44', '#26334b'],
  },
];

export const reviews = [
  {
    name: 'Sarah M.',
    text: "I'm blown away by the quality and style of the clothes I received. Every piece exceeded my expectations.",
  },
  {
    name: 'Alex K.',
    text: 'Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co.',
  },
  {
    name: 'James L.',
    text: 'The selection is diverse and genuinely stylish. The delivery was quick and everything fit beautifully.',
  },
];

export const formatPrice = (price: number) => `$${price}`;
