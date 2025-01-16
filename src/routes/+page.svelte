<script>
  import { onMount } from 'svelte';
  import Scroller from "@sveltejs/svelte-scroller";
  import {products} from "$lib";
  import {timer, time} from "$lib/stores/timer"
  import { beforeNavigate } from "$app/navigation";

  
  // let cookiesShown = true
  // function handleCookieAccept(accepted){
  //   cookiesShown = true
  //   if (accepted) {
  //     // write cookie accepted to local storage
  //     localStorage.setItem("cookiesAccepted", "true")
  //     // emit custom event showing cookie was accepted:
  //     document.dispatchEvent(new CustomEvent("cookiesAccepted"))
  //   }
  // }

  // function openWaitlistCapture() {
  //   window._klOnsite = window._klOnsite || [];
  //   window._klOnsite.push(['openForm', 'U8x9KF']);
  // }

  // let scrollY = 0;
	// let windowScrollY = 0;
	// let isScrollingDown = false;

	// let header_position = 0;
	// let header_height = 0;

	// let window_width = 0;

	// beforeNavigate(() => {
	// 	windowScrollY = 0;
	// });

	// function handleScroll() {
	// 	const currentScrollY = windowScrollY;
	// 	isScrollingDown = currentScrollY > scrollY;
	// 	scrollY = currentScrollY;

	// 	if (isScrollingDown && windowScrollY > 100) {
	// 		header_position = -100;
	// 	} else {
	// 		header_position = 0;
	// 	}
	// }

  // let showSplash = true; // Toggle splash during development
  // let preloadReady = false;
  // let imageLoadTracker = 0, videoLoadTracker=0, imageLoadPercentage=2, videoLoadPercentage=2;
  // let splashVideo, heroVideo, videosPaused=false;
  // let videosReady = false
  // let r;

  // let windowWidth = 0
  let flipbookLength = 31
  // let flipbook = []
  // let productFlipbookSets = {}

  // let entranceManager, onScreenManager, resetManager;

  // let headerIsBlack = false

  const preloadImageUrls = products.map(product => {
    const productImages = []

    // Add vercel image connections here as well:

    for (let i=0;i<flipbookLength;i++) { 
      
      const staticSrcDesktop = `https://touchland-clp-git-image-optimize-zero-studios.vercel.app/products/${product.id}/flipbook/desktop/${product.filePrefix}${i< 10 ? "0"+i : i}.png`
      const staticSrcMobile = `https://touchland-clp-git-image-optimize-zero-studios.vercel.app/${product.id}/flipbook/mobile/${product.filePrefix}${i< 10 ? "0"+i : i}.png`

      const vercelSrcDesktop = `/_vercel/image?url=${encodeURIComponent(staticSrcDesktop)}&w=1920&q=80`
      const vercelSrcMobile = `/_vercel/image?url=${encodeURIComponent(staticSrcMobile)}&w=800&q=80`

      productImages.push(
        {
          src: vercelSrcDesktop,
          mobile: false,
        }
      )
      productImages.push(
        {
          src: vercelSrcMobile,
          mobile: true,
        }
      )
    }
    productImages.push(
      {
        src: `/products/${product.id}/lifestyle-bg.jpg`,
        mobile: false,
      }
    )
    productImages.push(
      {
        src: `/products/${product.id}/lifestyle-bg-mobile.jpg`,
        mobile: true,
      }
    )
    return productImages;
  }).flat()

  // const preloadVideoUrls = products.map(product => {
  //   return [
  //     `/products/${product.id}/product-bg-compressed.mp4`
  //   ];
  // }).flat()

  // function handleVideoPause(){
  //   if (videosPaused) {
  //     document.querySelectorAll("video").forEach(video => video?.play())
  //     videosPaused=false
  //   } else {
  //     document.querySelectorAll("video").forEach(video => video?.pause())
  //     videosPaused=true
  //   }
  // }

  // function updateImageLoadProgress(){
  //   imageLoadTracker ++
  //   imageLoadPercentage = Math.floor(50*(imageLoadTracker/preloadImageUrls.length))
  // }

  // function updateVideoLoadProgress(videos) {
  //   const totalVideos = videos.length;

  //   // Function to update the count of ready videos
  //   function checkVideos() {
  //       for (let i = 0; i < totalVideos; i++) {
  //           const video = videos[i];

  //           // Check if the video is ready to play (can play or has loaded enough data)
  //           if (video.readyState >= 3 && !video.isReady) {
  //               video.isReady = true; // Mark video as ready
  //               videoLoadTracker++;
  //               videoLoadPercentage = Math.floor(50*(videoLoadTracker/totalVideos))

  //               video.pause()
  //               // If all videos are ready, stop the interval
  //               if (videoLoadTracker === totalVideos) {
  //                   clearInterval(interval);
  //               }
  //           }
  //       }
  //   }

  //   // Set an interval to check every 500ms for video readiness
  //   const interval = setInterval(checkVideos, 500);
  // }

  // onMount(()=> {
  //   document.addEventListener("cookiesAccepted", () => {
  //     console.log("CUSTOM EVENT - COOKIES ACCEPTED")
  //   })

  //   // hardcode the freaking height.
  //   // document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

  //   timer.start() // Countdown clock in header

  //   // check local storage for cookiesaccepted:
  //   if (!localStorage.getItem("cookiesAccepted")) {
  //     cookiesShown = false
  //   }

  //   // To use the Image class, this needs to be done in onMount
  //   // However, these images have already been preloaded in the preload phase
  //   products.forEach(product => {
  //     // Do the window query here
  //     productFlipbookSets[product.id] = []
  //     for (let i = 0; i < flipbookLength; i++) {
  //       if (window.innerWidth < 768) {
  //         productFlipbookSets[product.id].push(new Image(800,800))

  //         // Use srcset for Vercel Image optimization here:
  //         const staticSrc = `https://touchland-clp-git-image-optimize-zero-studios.vercel.app/products/${product.id}/flipbook/mobile/${product.filePrefix}${i< 10 ? "0"+i : i}.png`
  //         productFlipbookSets[product.id][i].src = `/_vercel/image?url=${encodeURIComponent(staticSrc)}&w=${800}&q=80`
  //       } else {
  //         productFlipbookSets[product.id].push(new Image(1920,1920))
  //         const staticSrc = `https://touchland-clp-git-image-optimize-zero-studios.vercel.app/products/${product.id}/flipbook/desktop/${product.filePrefix}${i< 10 ? "0"+i : i}.png`
  //         productFlipbookSets[product.id][i].src = `/_vercel/image?url=${staticSrc}&w=${1920}&q=80`
  //       }
  //     }
  //   })

  //   entranceManager = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //           handleEntrance(entry)
  //       }
  //     });
  //   }, {
  //     threshold: [0.1,0.9]
  //   });

  //   resetManager = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         resetScene()
  //       }
  //     });
  //   }, {
  //     threshold: 0.8
  //   });

  //   onScreenManager = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         handleOnScreen(entry)
  //       }
  //     });
  //   }, {
  //     threshold: 0.7
  //   });

  //   resetManager.observe(document.querySelector("[data-scroll-reset]"))

  //   // Turn header text black when over non-video part of hero
  //   entranceManager.observe(document.querySelector("[data-header-black]"))

  //   // Turn it white again when it's over the scroll scene
  //   entranceManager.observe(document.querySelector("[data-header-white]"))

  //   // Handle scroll events in scroll sequence:
  //   document.querySelectorAll("[data-scroll-node]").forEach((node) => {
  //     entranceManager.observe(node)
  //   })
  //   document.querySelectorAll("[data-scroll-onscreen]").forEach((node) => {
  //     onScreenManager.observe(node)
  //   })

  //   updateVideoLoadProgress(document.querySelectorAll("video"))

  //   const loadFallback = setTimeout(()=>{
  //     onPreloadComplete()
  //     clearTimeout(loadFallback)
  //   },9000)
  // })

  // function onPreloadComplete(){

  //   // Ensure it doesnt fire twice if the preload completes after the loadFallback has already fired
  //   if (preloadReady) return;
  //   // Use requestAnimationFrame to animate the load percentage the rest of the way to 100%:
  //   if (document.querySelector("[data-load-percentage]")) {
  //     let loadPercentage = parseInt(document.querySelector("[data-load-percentage]").textContent)
  //     function animateLoadPercentage() {
  //       if (loadPercentage < 100) {
  //         loadPercentage++
  //         document.querySelector("[data-load-percentage]").textContent = loadPercentage
  //         requestAnimationFrame(animateLoadPercentage)
  //       } else {

  //         // handle splash screen
  //       preloadReady = true;
  //       document.querySelectorAll("[data-product-bg] video").forEach(video => video.pause())
  //       showSplash ? splashVideo?.play() : heroVideo?.play()
  //       if (!showSplash) {
  //         document.querySelector(".hero").classList.add("entered")
  //         document.querySelector("svelte-scroller-outer").classList.add("entered")
  //         document.documentElement.style.overflow="unset"
  //       }
  //       debounce(()=>window.scrollTo(0,40),100)()
  //       headerIsBlack = false
  //     }
  //     }
  //     requestAnimationFrame(animateLoadPercentage)
  //   }
  // }

  // function handleSplashEnd(){
  //   heroVideo.play(); 
  //   splashVideo.parentElement.remove();
  //   document.documentElement.style.overflow="unset";
  //   window.scrollTo(0, 0)
  //   if (showSplash) {
  //     document.querySelector(".hero").classList.add("entered");
  //     document.querySelector("svelte-scroller-outer").classList.add("entered");
  //   }
  // }

  // // Remove preload screen:
  // $: {
  //   // only half of the flipbook images (either desktop or mobile) are loaded, so multiply by 2
  //   if (imageLoadTracker*2 === (preloadImageUrls.length) && videoLoadTracker === (preloadVideoUrls.length+(showSplash ? 3 : 2))) {
  //     onPreloadComplete()
  //   }
  // }

  // let 
  //   scrollContainer, 
  //   index, 
  //   offset, 
  //   progress,

  //   animThreshold = 0.05, 
  //   onScreenThreshold=0.9, 
  //   sectionsPerProduct=5,
  //   bgZoom = 1.5, 
  //   textEnterSpeed=30,
  //   productImageEnterSpeed=20;

  //   function drawImageScaled(img, ctx) {
  //     var canvas = ctx.canvas;
  //     var canvasWidth = canvas.width;
  //     var canvasHeight = canvas.height;
  //     // Calculate the scaling ratio based on the height of the canvas
  //     var scaleRatio = canvasHeight / img.height;

  //     // Calculate the new width while maintaining the aspect ratio
  //     var newWidth = img.width * scaleRatio;

  //     // Calculate the offset to center the image horizontally
  //     var centerShiftX = (canvasWidth - newWidth) / 2;

  //     // Clear the canvas before drawing
  //     ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  //     // Draw the image with the adjusted width and height
  //     ctx.drawImage(
  //         img,
  //         0, 0, img.width, img.height,  // Source dimensions
  //         centerShiftX, 0, newWidth, canvasHeight  // Destination dimensions
  //     );
  //   }

  //   function handleFlipbookOnScrollDown(entry) {
  //     const flipbook = productFlipbookSets[entry.target.dataset.flipbookEnter]
  //     const productCanvas = document.querySelector(`[data-product-canvas="${entry.target.dataset.flipbookEnter}"]`)
  //     const productLanding = document.querySelector(`[data-product-landing="${entry.target.dataset.flipbookEnter}"]`)
      
  //     if (productCanvas.classList.contains("flipbook-animating") || productCanvas.classList.contains("flipbook-entered")) return;
  //     productCanvas.classList.add("flipbook-animating")
      
  //     const canvas_context = productCanvas.getContext('2d');
  //     const canvas_width = productCanvas.clientWidth;
  //     const canvas_height = productCanvas.clientHeight;

  //     let i = 0;
  //     let lastTimestamp = 0;

  //     function animate(timestamp) {
  //       if (!lastTimestamp) lastTimestamp = timestamp; // Initialize the timestamp

  //       const elapsed = timestamp - lastTimestamp;

  //       if (elapsed >= productImageEnterSpeed) {
  //         if (i < flipbookLength) {
  //           drawImageScaled(flipbook[i], canvas_context); // Draw the current frame
  //           i++;
  //           if (i==flipbookLength) {
  //             productCanvas.classList.add("flipbook-entered")
  //             productCanvas.classList.remove("flipbook-animating")
  //           }
  //           lastTimestamp = timestamp; // Reset the timestamp after drawing
  //         } else if (productCanvas.classList.contains("flipbook-entered")) {
  //           drawImageScaled(flipbook[flipbook.length-1], canvas_context); // Draw the current frame
  //           lastTimestamp = timestamp; // Reset the timestamp after drawing
  //         } else {
  //           // Animation complete
  //           // productLanding.style.opacity = 1;
  //           // canvas_context.clearRect(0, 0, canvas_width, canvas_height);

  //           return; // Stop the animation
  //         }
  //       }

  //       requestAnimationFrame(animate); // Request the next frame
  //     }

  //     // Start the animation
  //     requestAnimationFrame(animate);
  //   }
    
  //   function handleEntrance(entry){
  //     if (entry.target.dataset.flipbookEnter) {
  //       if (isScrollingDown) {
  //         handleFlipbookOnScrollDown(entry)
  //       } else {
  //         const flipbook = productFlipbookSets[entry.target.dataset.flipbookEnter]
  //         const productCanvas = document.querySelector(`[data-product-canvas="${entry.target.dataset.flipbookEnter}"]`)
  //         const productLanding = document.querySelector(`[data-product-landing="${entry.target.dataset.flipbookEnter}"]`)

  //         if (productCanvas.classList.contains("flipbook-animating") || !productCanvas.classList.contains("flipbook-entered") ) return;
  //         productCanvas.classList.remove("flipbook-entered")
  //         productCanvas.classList.add("flipbook-animating")

  //         const canvas_context = productCanvas.getContext('2d');
  //         const canvas_width = productCanvas.clientWidth;
  //         const canvas_height = productCanvas.clientHeight;

  //         let i = flipbookLength-1;
  //         let lastTimestamp = 0;

  //         function animate(timestamp) {
  //           if (!lastTimestamp) lastTimestamp = timestamp; // Initialize the timestamp

  //           const elapsed = timestamp - lastTimestamp;

  //           if (elapsed >= productImageEnterSpeed) {
  //             if (i >= 0) {

  //               // if (productLanding.style.opacity != "0") productLanding.style.opacity = "0"
  //               canvas_context.clearRect(0, 0, canvas_width, canvas_height);
  //               drawImageScaled(flipbook[i], canvas_context)
  //               i--
  //               lastTimestamp = timestamp; // Reset the timestamp after drawing
  //             } else {
  //               // Animation complete
  //               productCanvas.classList.remove("flipbook-animating")
  //               return; // Stop the animation
  //             }
  //           }

  //           requestAnimationFrame(animate); // Request the next frame
  //         }

  //         // Start the animation
  //         requestAnimationFrame(animate);


  //         // Unpause bg video!
  //         document.querySelector(`[data-product-bg="${entry.target.dataset.videoUpdater}"] video`)?.play()
  //       }
        
  //     } else if (entry.target.dataset.flipbookExit && !isScrollingDown) {
  //       // console.log("Fire flipbook exit")
  //       // const flipbook = productFlipbookSets[entry.target.dataset.flipbookExit]
  //       // const productCanvas = document.querySelector(`[data-product-canvas="${entry.target.dataset.flipbookExit}"]`)
  //       // const productLanding = document.querySelector(`[data-product-landing="${entry.target.dataset.flipbookExit}"]`)

  //       // if (productCanvas.classList.contains("flipbook-animating") || !productCanvas.classList.contains("flipbook-entered") ) return;
  //       // productCanvas.classList.add("flipbook-animating")

  //       // const canvas_context = productCanvas.getContext('2d');
  //       // const canvas_width = productCanvas.clientWidth;
  //       // const canvas_height = productCanvas.clientHeight;

  //       // let i = flipbookLength-1;
  //       // const flipbookInterval = setInterval(()=>{
  //       //   if (i >= 0) {
  //       //     productLanding.style.opacity = "0"

  //       //     canvas_context.clearRect(0, 0, canvas_width, canvas_height);
  //       //     drawImageScaled(flipbook[i], canvas_context)
  //       //     i--
  //       //   } else {
  //       //     clearInterval(flipbookInterval)
  //       //     productCanvas.classList.remove("flipbook-animating")
  //       //   }
  //       // }, productImageEnterSpeed)
  //       // productCanvas.classList.remove("flipbook-entered")
  //     } else if (entry.target.dataset.productVideo) {
  //       // Play fixed video background which is outside scroller
  //       if (isScrollingDown) {
  //         document.querySelector(`[data-lifestyle-bg="${entry.target.dataset.productVideo}"] .image-mask`).classList.add("diminished")
  //         if (!videosPaused) document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"] video`).play()
  //         document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"]`).classList.add("entered")

  //       } else {
  //         document.querySelector(`[data-lifestyle-bg="${entry.target.dataset.productVideo}"] .image-mask`).classList.remove("diminished")
  //         document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"] video`).pause()
  //         document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"]`).classList.add("entered")

  //       }
  //     } else if (entry.target.dataset.headerBlack) {
  //       headerIsBlack = true

  //     } else if (entry.target.dataset.headerWhite) {
  //       headerIsBlack = false
  //       document.querySelector("[data-scroll-prompt]").classList.add("hidden")

  //       if (isScrollingDown) {
  //         // pause hero video
  //         heroVideo.pause()
  //       } else {
  //         // play hero video
  //         heroVideo.play()
  //       }
  //     }
  //     entry.target.classList.add("entered");  
  //   }

  //   function handleOnScreen(entry) {
  //     if (entry.target.dataset.lifestyleBg) {

  //       if (isScrollingDown) {
  //         if (!videosPaused) document.querySelector(`[data-product-bg="${entry.target.dataset.lifestyleBg-1}"] video`)?.pause()
  //       } else {
  //         // This is failing
  //         // document.querySelector(`[data-product-bg="${entry.target.dataset.lifestyleBg-1}"] video`)?.play()
  //       }
  //       // When the lifestyle background is on screen, animate in the lifestyle text
  //       Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
  //         setTimeout(() => {
  //           char.classList.add("entered")
  //         }, i*textEnterSpeed)
  //       })

  //       // document.querySelector(`[data-product-bg="${entry.target.dataset.productText-1}"]`)?.pause()
  //     } else if (entry.target.dataset.productText) {
  //       // Ensure lifestyle video is paused
  //       // document.querySelector(`[data-lifestyle-bg="${entry.target.dataset.productText}"]`).querySelector("video").pause()
  //       // Once the container for the product text is fully on screen, animate in the text
  //       Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
  //         setTimeout(() => {
  //           char.classList.add("entered")
  //         }, i*textEnterSpeed)
  //       })
  //     }
  //   }

  //   function handleExit(entry){
  //   }

  //   function prepareCanvasForFlipbook(canvas) {
  //     const rect = canvas.parentElement.getBoundingClientRect();
  //     canvas.width = Math.round (r * rect.right) - Math.round (r * rect.left);
  //     canvas.height = Math.round (r * rect.bottom) - Math.round (r * rect.top);
  //     canvas.style.transform = `scale3d(${1/r},${1/r},1)`;
  //     canvas.style.transformOrigin = "top left";

  //     // canvas.width = canvas.parentElement.clientWidth;
  //     // canvas.height = canvas.parentElement.clientHeight;

  //     // Try out removing anti-aliasing?
  //     // const ctx = canvas.getContext('2d');
  //     // ctx.webkitImageSmoothingEnabled = false;
  //     // ctx.mozImageSmoothingEnabled = false;
  //     // ctx.imageSmoothingEnabled = false;
  //   }

  //   // update background scales based on scroll position
  //   function calculateLifestyleBgScale(productIndex){
  //     // special case for the first lifestyle background bc it is the only one where a negative offset is possible:
  //     if (productIndex == 0) return offset < 0 ? 1-(offset/2) : 1
  //     return (index==productIndex*sectionsPerProduct-1) ? 1.33-(offset/3) : 1
  //   }
  //   function calculateProductBgScale(productIndex){
  //     return (index==productIndex*sectionsPerProduct) ? 1.33-(offset/3) : 1
  //   }

  //   function handleResize(){
  //     document.querySelectorAll("[data-product-canvas]").forEach((canvas) => {
  //       prepareCanvasForFlipbook(canvas)
  //     })
  //   }
  //   // Wrap handleResize in a debounce function to prevent it from firing too often:
  //   function debounce(func, wait=200, immediate) {
  //     let timeout;
  //     return function() {
  //       const context = this, args = arguments;
  //       const later = function() {
  //         timeout = null;
  //         if (!immediate) func.apply(context, args);
  //       };
  //       const callNow = immediate && !timeout;
  //       clearTimeout(timeout);
  //       timeout = setTimeout(later, wait);
  //       if (callNow) func.apply(context, args);
  //     };
  //   };


  //   function resetScene() {
  //     // Instant scroll to top:
  //     window.scrollTo(0,0)

  //     // Remove all entrances AND reset flipbook canvases
  //     document.querySelector(".foreground-slot").querySelectorAll(".entered").forEach((el) => {
  //       el.classList.remove("entered")
  //     })
  //     document.querySelectorAll("[data-product-bg]").forEach((el) => {
  //       el.classList.remove("entered")
  //     })
  //     document.querySelector(".foreground-slot").querySelectorAll(".diminished").forEach((el) => {
  //       el.classList.remove("diminished")
  //     })
  //     document.querySelector(".foreground-slot").querySelectorAll(".flipbook-entered").forEach((el) => {
  //       el.classList.remove("flipbook-entered")
  //     })
  //     document.querySelectorAll("[data-product-canvas]").forEach((canvas) => {
  //       const ctx = canvas.getContext('2d');
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     })
  //     document.querySelectorAll("[data-product-landing]").forEach((img) => {
  //       img.style.opacity = 0
  //     })
  //     heroVideo.play()
  //   }
</script>

<svelte:head>

  {#each preloadImageUrls as image, i}
    {console.log(image.src)}
    {#if image.mobile}

      <link rel="preload" as="image" media="(max-width: 768px)" href={image.src} />
    {:else}
      <link rel="preload" as="image" media="(min-width: 768px)" href={image.src} />
    {/if}
  {/each}
</svelte:head>

