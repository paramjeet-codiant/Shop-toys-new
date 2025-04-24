import { redirect } from '@shopify/remix-oxygen';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import { useVariantUrl } from '~/lib/variants';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { useState } from 'react';
import { ProductFilter } from '~/components/ProductFilter.jsx';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.collection.title ?? ''} Collection` }];
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
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw redirect('/collections');
  }
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });
  const url = new URL(request.url);
  const filters = parseFiltersFromSearchParams(url.searchParams);
  const sortKey = url.searchParams.get('sortKey') || 'RELEVANCE';
  const reverse = url.searchParams.get('reverse') === 'true';
  const variables = {
    handle,
    ...paginationVariables,
    ...(filters.length > 0 && { filters }),
    sortKey,
    reverse,
  };

  console.log('FILTERS:', filters);

  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables,
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context }) {
  return {};
}
function parseFiltersFromSearchParams(searchParams) {
  const filters = [];

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    if (key.startsWith('filter.v.option.')) {
      const optionName = key.replace('filter.v.option.', '');
      filters.push({
        variantOption: {
          name: optionName,
          value,
        },
      });
    }

    if (key === 'filter.v.price.gte') {
      filters.push({ price: { min: parseFloat(value) } });
    }

    if (key === 'filter.v.price.lte') {
      filters.push({ price: { max: parseFloat(value) } });
    }

    // ✅ Metafield filters (parse filter.p.m.namespace.key=value)
    if (key.startsWith('filter.p.m.')) {
      const match = key.match(/^filter\.p\.m\.([^.]+)\.([^.]+)$/);
      if (match) {
        const [, namespace, metafieldKey] = match;
        filters.push({
          productMetafield: {
            namespace,
            key: metafieldKey,
            value,
          },
        });
      }
    }
  }

  return filters;
}
const sortOptions = [
  { label: 'Featured', sortKey: 'MANUAL', reverse: false },
  { label: 'Price: Low to High', sortKey: 'PRICE', reverse: false },
  { label: 'Price: High to Low', sortKey: 'PRICE', reverse: true },
  { label: 'Newest to Oldest', sortKey: 'CREATED', reverse: true },
  { label: 'Oldest to Newest', sortKey: 'CREATED', reverse: false },
  { label: 'Alphabetical A–Z', sortKey: 'TITLE', reverse: false },
  { label: 'Alphabetical Z–A', sortKey: 'TITLE', reverse: true },
];
export default function Collection() {
  /** @type {LoaderReturnData} */
  const { collection, sortKey, reverse } = useLoaderData();
  const [searchParams] = useSearchParams();
  const [selectedSort, setSelectedSort] = useState(() => {
    const sortKeyParam = searchParams.get('sortKey') || 'CREATED';
    const reverseParam = searchParams.get('reverse') || 'true';

    const match = sortOptions.find(
      (opt) =>
        opt.sortKey === sortKeyParam &&
        String(opt.reverse) === String(reverseParam)
    );

    return match || sortOptions[0]; // default fallback
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentSort = sortOptions.find(
    (opt) => opt.sortKey === sortKey && opt.reverse === reverse
  ) || sortOptions[0];

  const buildSortUrl = (option) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortKey', option.sortKey);
    newParams.set('reverse', option.reverse);
    return `?${newParams.toString()}`;
  };

  return (
    <div className="collection">
      <h1>{collection.title}</h1>
      <div className='sort-options'>
        <select
          value={`${selectedSort.sortKey}|${selectedSort.reverse}`}
          onChange={(e) => {
            const [sortKey, reverse] = e.target.value.split('|');
            const newParams = new URLSearchParams(searchParams);
            newParams.set('sortKey', sortKey);
            newParams.set('reverse', reverse);

            // Update selected sort before navigating
            const match = sortOptions.find(
              (opt) =>
                opt.sortKey === sortKey && String(opt.reverse) === reverse
            );
            if (match) {
              setSelectedSort(match);
            }

            // Navigate to new URL (can use window.location.href or better: use navigate())
            window.location.href = `?${newParams.toString()}`;
          }}
          className="border px-2 py-1 rounded mb-4"
        >
          {sortOptions.map((opt) => (
            <option key={`${opt.sortKey}|${opt.reverse}`} value={`${opt.sortKey}|${opt.reverse}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="products-grid-wrapper flex">
        <div className="products-grid-filter w-1/5">
          <ProductFilter filters={collection.products.filters} />
        </div>
        <div className="products-grid w-full">
          {collection.products.nodes.length > 0 ? (
            <div className={`products-grid-items products-grid grid gap-4`}>
              {collection.products.nodes.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No matching products found.</p>
              <Link to="?"><button>Clear Filters</button></Link>
            </div>
          )}
          <Analytics.CollectionView
            data={{
              collection: {
                id: collection.id,
                handle: collection.handle,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({ product, loading }) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
          crop=''
          width={1000}
          className='w-full h-[500px] object-cover'
        />
      )}
      <h4>{product.title}</h4>
      <span className='text-red-900 font-bold'>
        <Money data={product.priceRange.minVariantPrice} />
      </span>
      {product.variants.nodes[0]?.compareAtPriceV2 && (
        <span className="text-sm text-gray-400 line-through">
          <Money data={product.variants.nodes[0].compareAtPriceV2} />
        </span>
      )}
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
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
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $filters: [ProductFilter!]
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
     $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        filters: $filters
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...ProductItem
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
