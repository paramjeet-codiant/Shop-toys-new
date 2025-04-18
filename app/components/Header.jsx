import { Suspense } from 'react';
import { Await, NavLink, useAsyncValue } from '@remix-run/react';
import { useAnalytics, useOptimisticCart } from '@shopify/hydrogen';
import { useAside } from '~/components/Aside';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';


/**
 * @param {HeaderProps}
 */
export function Header({ header, isLoggedIn, cart, publicStoreDomain }) {
  const { menu } = header;
  return (
    <header className="header">
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <NavLink prefetch="intent" to="/" className={'header-logo-link'} style={activeLinkStyle} end>
        <img
          className="header-logo" alt='' src='/app/assets/logo-transparent.png' />
      </NavLink>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function AnnouncementSwiper() {
  return (
    <div className="p-4 announcement_bar">
      <div className='max-w-[420px] mx-auto relative'>
        <Swiper modules={[Navigation, Autoplay]} loop={true} navigation={{ clickable: true, prevEl: '.slide-prev', nextEl: '.slide-next' }} autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}>
          <SwiperSlide>Free shipping on orders over $50</SwiperSlide>
          <SwiperSlide>New arrivals now in stock</SwiperSlide>
          <SwiperSlide>Easy returns within 30 days</SwiperSlide>
        </Swiper>
        <button className="slide-prev slide-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 5 9" fill="none"><path d="M4.09196 7.97969L0.461804 4.46096L3.98054 0.830797" stroke="white" strokeWidth="0.89372" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>
        <button className="slide-next slide-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 5 9" fill="none"><path d="M0.913402 0.830811L4.48828 4.40569L0.913402 7.98057" stroke="white" strokeWidth="0.89372" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>
      </div>
    </div>
  );
}
/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const { close } = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({ isLoggedIn, cart }) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      {/* <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink> */}
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 27" fill="currentColor" className="w-[28px] h-[28px]"><title>Search</title><path xmlns="http://www.w3.org/2000/svg" d="M22.3314 24.3L14.7939 16.7625C14.2314 17.1937 13.5892 17.5312 12.8673 17.775C12.1455 18.0188 11.3533 18.1406 10.4908 18.1406C8.33453 18.1406 6.52047 17.4047 5.04859 15.9328C3.57672 14.4609 2.84078 12.6656 2.84078 10.5469C2.84078 8.42812 3.57672 6.63281 5.04859 5.16094C6.52047 3.68906 8.31578 2.95312 10.4345 2.95312C12.5533 2.95312 14.3486 3.68906 15.8205 5.16094C17.2923 6.63281 18.0283 8.42812 18.0283 10.5469C18.0283 11.4094 17.9064 12.1922 17.6627 12.8953C17.4189 13.5984 17.0627 14.2688 16.5939 14.9062L24.1877 22.4438L22.3314 24.3ZM10.4345 15.5813C11.8595 15.5813 13.0548 15.0984 14.0205 14.1328C14.9861 13.1672 15.4689 11.9719 15.4689 10.5469C15.4689 9.14062 14.9861 7.95 14.0205 6.975C13.0548 6 11.8689 5.5125 10.4627 5.5125C9.01891 5.5125 7.81422 6 6.84859 6.975C5.88297 7.95 5.40016 9.14062 5.40016 10.5469C5.40016 11.9719 5.88297 13.1672 6.84859 14.1328C7.81422 15.0984 9.00953 15.5813 10.4345 15.5813Z" fill="#bf2960"></path></svg>
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({ count }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();

  return (
    <a id='cart-icon'
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 21" width="28" height="28" aria-label="cart" fill="#000"><title>Cart</title><path xmlns="http://www.w3.org/2000/svg" d="M2.23051 20.6384C1.64225 20.6384 1.12343 20.4219 0.674056 19.9888C0.224685 19.5558 0 19.0288 0 18.4079V6.42192C0 5.80097 0.224685 5.26989 0.674056 4.82869C1.12343 4.38749 1.64225 4.16689 2.23051 4.16689H4.33847V3.92178C4.37115 2.84329 4.77967 1.92004 5.56403 1.15202C6.34838 0.384008 7.28798 0 8.38281 0C9.47764 0 10.4213 0.384008 11.2138 1.15202C12.0064 1.92004 12.419 2.84329 12.4517 3.92178V4.16689H14.5351C15.1234 4.16689 15.6463 4.38749 16.1038 4.82869C16.5614 5.26989 16.7901 5.80097 16.7901 6.42192V18.4079C16.7901 19.0288 16.5614 19.5558 16.1038 19.9888C15.6463 20.4219 15.1234 20.6384 14.5351 20.6384H2.23051ZM6.59349 3.92178V4.16689H10.1966V3.92178C10.1639 3.48058 9.97603 3.0884 9.63287 2.74525C9.28972 2.40209 8.87303 2.23051 8.38281 2.23051C7.89258 2.23051 7.47998 2.40209 7.14499 2.74525C6.81001 3.0884 6.62618 3.48058 6.59349 3.92178ZM2.23051 18.4079H14.5351V6.42192H12.4517V8.23574C12.4517 8.54622 12.3414 8.81175 12.1208 9.03235C11.9002 9.25295 11.6346 9.36325 11.3241 9.36325C11.0137 9.36325 10.7522 9.25295 10.5398 9.03235C10.3274 8.81175 10.2211 8.54622 10.2211 8.23574V6.42192H6.56898V8.23574C6.56898 8.54622 6.45868 8.81175 6.23808 9.03235C6.01748 9.25295 5.75195 9.36325 5.44147 9.36325C5.131 9.36325 4.86954 9.25295 4.65711 9.03235C4.44468 8.81175 4.33847 8.54622 4.33847 8.23574V6.42192H2.23051V18.4079ZM2.23051 18.4079V6.42192V18.4079Z" fill="#bf2960"></path></svg> <span className='cart-count'>{count === null ? <span>&nbsp;</span> : count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({ cart }) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({ isActive, isPending }) {
  return {
    fontWeight: isActive ? 'normal' : undefined,
    color: isPending ? 'grey' : '#bf2960',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
