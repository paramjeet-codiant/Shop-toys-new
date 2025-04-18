import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Hydrogen | Home' }];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */


async function loadCriticalData({ context }) {
  const tabbedCollectionHandles = ['best-sellers', 'new-arrivals', 'dressed-up-bears', 'tiny-teddies'];

  const tabbedCollections = (
    await Promise.all(
      tabbedCollectionHandles.map(async (handle) => {
        const { collection } = await context.storefront.query(
          TAB_FIRST_COLLECTION_QUERY,
          { variables: { handle } }
        );
        return collection;
      })
    )
  ).filter(Boolean);
  const { collections } = await context.storefront.query(ALL_COLLECTIONS_QUERY);
  return {
    tabbedCollections, categories: collections?.nodes || [],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context }) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}
const offers = [
  {
    img: '1.png',
  },
  {
    img: '2.png',
  },
  {
    img: '3.png',
  },
  {
    img: '4.png',
  }
]

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const customCollections = data.tabbedCollections;
  const allcollections = data.categories;
  // console.log('data', allcollections);

  // if (!customCollections || customCollections.length === 0) {
  //   return <p className="text-center">No collections found.</p>;
  // }

  return (
    <div className="home">
      <section className="home-banner">
        <div className="home-banner-content">
          <img alt="banner" src="app/assets/banner.jpg" height={600} />
        </div>
      </section>

      <section className="home-offers">
        <div className="home-offers-content">
          {offers.map((offer) => (
            <img alt="offer" src={`app/assets/${offer.img}`} key={offer.img} />
          ))}
        </div>
      </section>

      <section className="shop-latest">
        <div className="shop-latest-content">
          <h1>Shop The Latest</h1>
          <ul className="nav nav-tabs" id="collectionTabs" role="tablist">
            {customCollections.map((collection, index) => (
              <li className="nav-item" role="presentation" key={collection.id}>
                <button
                  className={`nav-link ${index === 0 ? 'active' : ''}`}
                  id={`tab-${collection.handle}`}
                  data-bs-toggle="tab"
                  data-bs-target={`#pane-${collection.handle}`}
                  type="button"
                  role="tab"
                  aria-controls={`pane-${collection.handle}`}
                  aria-selected={index === 0}
                >
                  {collection.title}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content mt-3 relative" id="collectionTabContent">
            {customCollections.map((collection, index) => (
              <div
                className={`tab-pane fade ${index === 0 ? 'show active' : ''}`}
                id={`pane-${collection.handle}`}
                role="tabpanel"
                aria-labelledby={`tab-${collection.handle}`}
                key={collection.id}
              >
                <Swiper
                  modules={[Navigation]}
                  navigation={{ clickable: true, prevEl: '.slide-prev2', nextEl: '.slide-next2' }}
                  spaceBetween={20}
                  slidesPerView={5}
                  loop={true}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 4 },
                  }}
                >
                  {collection.products?.nodes?.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="card h-100">
                        {product.images?.nodes?.[0] && (
                          <a href={`/products/${product.handle}`}><Image
                            height={1000}
                            width={1000}
                            data={product.images.nodes[0]}
                            aspectRatio="1/1"
                            crop=""
                          /></a>
                        )}
                        <div className="card-body py-3">
                          <h5 className="card-title">
                            <a href={`/products/${product.handle}`}>{product.title}</a>
                          </h5>
                          <div className='card-price flex gap-2'>
                            <span className='text-red-900'>
                              <Money data={product.priceRange.minVariantPrice} />
                            </span>
                            {product.variants.nodes[0]?.compareAtPriceV2 && (
                              <span className="text-sm text-gray-400 line-through">
                                <Money data={product.variants.nodes[0].compareAtPriceV2} />
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button className="slide-prev2 slide-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 5 9" fill="none">
                    <path d="M4.09196 7.97969L0.461804 4.46096L3.98054 0.830797" stroke="black" strokeWidth="0.89372" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                <button className="slide-next2 slide-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 5 9" fill="none">
                    <path d="M0.913402 0.830811L4.48828 4.40569L0.913402 7.98057" stroke="black" strokeWidth="0.89372" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='shop-category'>
        <h1>Shop by category</h1>
        <div className="shop-category-content">
          {allcollections.map((collection) => (
            <li className="nav-item" role="presentation" key={collection.id}>
              {collection.image?.url && (
                <a href={`/collections/${collection.handle}`}>
                  <Image
                    alt={collection.image.altText || collection.title}
                    src={collection.image.url}
                    width={500}
                    height={320}
                    crop=''
                  />
                </a>
              )}
            </li>
          ))}
        </div>
      </section>

      {/* <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );

}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({ collection }) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                  <Link
                    key={product.id}
                    className="recommended-product"
                    to={`/products/${product.handle}`}
                  >
                    <Image
                      data={product.images.nodes[0]}
                      aspectRatio="1/1"
                      sizes="(min-width: 45em) 20vw, 50vw"
                    />
                    <h4>{product.title}</h4>
                    <small>
                      <Money data={product.priceRange.minVariantPrice} />
                    </small>
                    {product.variants.nodes[0]?.compareAtPriceV2 && (
                      <span className="text-sm text-gray-400 line-through">
                        <Money data={product.variants.nodes[0].compareAtPriceV2} />
                      </span>
                    )}

                  </Link>
                ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 5) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
    }
        featuredImage {
          url
          altText
        }
      }
    }
  }

  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 5, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
          }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const TAB_FIRST_COLLECTION_QUERY = `#graphql
  fragment TabFirstCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
    products(first: 10) {
      nodes {
        id
        title
        handle
        images(first: 1) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
  query FeaturedCollection($handle: String!) {
    collection(handle: $handle) {
      ...TabFirstCollection
    }
  }
`;

const ALL_COLLECTIONS_QUERY = `
  query AllCollections {
  collections(first: 50, query: "collection_type:custom") {
      nodes {
      id
      handle
      title
      updatedAt
      descriptionHtml
        image {
        id
        url
        altText
        width
        height
      }
      products(first: 10) {
    nodes {
          id
          title
          handle
      featuredImage {
            url
            altText
          }
      priceRange {
        minVariantPrice {
              amount
              currencyCode
            }
        maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
        nodes {
              id
          price {
                amount
                currencyCode
              }
          compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
