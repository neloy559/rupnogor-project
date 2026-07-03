import { UserRepository } from '@/repositories/user.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { CartRepository } from '@/repositories/cart.repository';
import { OrderRepository } from '@/repositories/order.repository';
import { WishlistRepository } from '@/repositories/wishlist.repository';
import { AddressRepository } from '@/repositories/address.repository';
import { CategoryRepository } from '@/repositories/category.repository';
import { BannerRepository } from '@/repositories/banner.repository';
import { ReviewRepository } from '@/repositories/review.repository';
import { NewsletterRepository } from '@/repositories/newsletter.repository';

import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { WishlistService } from './wishlist.service';
import { AddressService } from './address.service';
import { CategoryService } from './category.service';
import { BannerService } from './banner.service';
import { ReviewService } from './review.service';
import { NewsletterService } from './newsletter.service';

// Repositories
export const userRepo = new UserRepository();
export const productRepo = new ProductRepository();
export const cartRepo = new CartRepository();
export const orderRepo = new OrderRepository();
export const wishlistRepo = new WishlistRepository();
export const addressRepo = new AddressRepository();
export const categoryRepo = new CategoryRepository();
export const bannerRepo = new BannerRepository();
export const reviewRepo = new ReviewRepository();
export const newsletterRepo = new NewsletterRepository();

// Services
export const authService = new AuthService(userRepo);
export const productService = new ProductService(productRepo);
export const cartService = new CartService(cartRepo);
export const orderService = new OrderService(orderRepo, cartRepo, productRepo, addressRepo);
export const wishlistService = new WishlistService(wishlistRepo);
export const addressService = new AddressService(addressRepo);
export const categoryService = new CategoryService(categoryRepo);
export const bannerService = new BannerService(bannerRepo);
export const reviewService = new ReviewService(reviewRepo);
export const newsletterService = new NewsletterService(newsletterRepo);