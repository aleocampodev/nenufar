export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  image: string;
}

export interface Skill {
  name: string;
  percentage: number;
  color: string;
}

export interface Store {
  id: number;
  title: string;
  locations: { neighborhood: string; address: string }[];
}
