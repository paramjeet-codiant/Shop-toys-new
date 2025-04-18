import { Image } from '@shopify/hydrogen';
import * as Dialog from '@radix-ui/react-dialog';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useState } from 'react';
import { Navigation, Zoom } from 'swiper/modules';
import 'swiper/css/zoom';
import 'swiper/css/navigation';

/**
 * @param {{
 *   media: Array<any>;
 * }}
 */
export function ProductImage({ media }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Open lightbox and set the active index
  const openLightbox = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  // Change main image when a thumbnail is clicked
  const changeMainImage = (index) => {
    setActiveIndex(index);
  };
  const changeMainImageInModal = (index) => {
    setActiveIndex(index);
  };
  const closeLightbox = () => {
    setIsOpen(false);
  };
  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div className="mb-4">
        {media.length > 0 && media[activeIndex].mediaContentType === 'IMAGE' && (
          <div>
            <Image
              data={media[activeIndex].image}
              alt={media[activeIndex].image.altText || 'Product Image'}
              className="w-full h-[400px] object-contain rounded-lg cursor-pointer"
              onClick={() => openLightbox(activeIndex)}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-4 overflow-x-auto py-2 justify-center">
        {media.map((item, index) => {
          if (item.mediaContentType === 'IMAGE') {
            return (
              <button
                key={item.id}
                onClick={() => changeMainImage(index)}
                className={`w-[80px] h-[80px] border border-gray-300 rounded-lg overflow-hidden ${activeIndex === index ? 'border-blue-500 border-2' : ''}`} // Highlight active thumbnail
              >
                <Image
                  data={item.image}
                  alt={item.image.altText || 'Product Image'}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          } else if (item.mediaContentType === 'VIDEO') {
            return (
              <button
                key={item.id}
                onClick={() => openLightbox(index)}
                className="w-[80px] h-[80px] border border-gray-300 rounded-lg overflow-hidden"
              >
                <video
                  src={item.sources[0].url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              </button>
            );
          }
        })}
      </div>

      {/* Lightbox Modal */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-white/70 z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white p-6 rounded-lg relative">
              {/* Close Icon */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-#000 text-3xl cursor-pointer z-50"
              >
                &times;
              </button>

              {/* Swiper for Lightbox */}
              <Swiper
                initialSlide={activeIndex} // Set the initial slide to activeIndex
                spaceBetween={20}
                centeredSlides
                slidesPerView={1}
                zoom
                navigation={{ clickable: true, prevEl: '.slide-prev2', nextEl: '.slide-next2' }}
                modules={[Zoom, Navigation]} // Swiper modules
              >
                {media.map((item, index) => {
                  return (
                    <SwiperSlide key={item.id}>
                      <div className="flex justify-center items-center h-[80vh]">
                        <div className="swiper-zoom-container cursor-zoom-in">
                          <Image
                            data={item.image}
                            alt={item.image.altText || 'Product Image'}
                            className="max-h-full object-contain"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* Thumbnails in the modal */}
              <div className="flex space-x-4 overflow-x-auto py-2 mt-4 justify-center">
                {media.map((item, index) => {
                  if (item.mediaContentType === 'IMAGE') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => changeMainImageInModal(index)} // Change main image in the modal
                        className={`w-[80px] h-[80px] border border-gray-300 rounded-lg overflow-hidden ${activeIndex === index ? 'border-blue-500 border-2' : ''}`} // Highlight active thumbnail
                      >
                        <Image
                          data={item.image}
                          alt={item.image.altText || 'Product Image'}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  } else if (item.mediaContentType === 'VIDEO') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => changeMainImageInModal(index)} // Open lightbox for videos as well
                        className="w-[80px] h-[80px] border border-gray-300 rounded-lg overflow-hidden"
                      >
                        <video
                          src={item.sources[0].url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      </button>
                    );
                  }
                })}
              </div>

              {/* Navigation buttons */}
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
