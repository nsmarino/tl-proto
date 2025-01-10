<script>
  import { onMount } from 'svelte';
  import Scroller from "@sveltejs/svelte-scroller";
  import {products} from "$lib";
  import {timer, time} from "$lib/stores/timer"
  import { beforeNavigate } from "$app/navigation";

  let cookiesAccepted = false
  function handleCookieAccept(){
    cookiesAccepted=true
  }

  function openWaitlistCapture() {
    console.log("Klaviyo popup open")
    window._klOnsite = window._klOnsite || [];
    window._klOnsite.push(['openForm', 'U8x9KF']);
  }
  let scrollY = 0;
	let windowScrollY = 0;
	let isScrollingDown = false;

	let header_position = 0;
	let header_height = 0;

	let window_width = 0;

	beforeNavigate(() => {
		windowScrollY = 0;
	});

	function handleScroll() {
		const currentScrollY = windowScrollY;
		isScrollingDown = currentScrollY > scrollY;
		scrollY = currentScrollY;

		if (isScrollingDown && windowScrollY > 100) {
			header_position = -100;
		} else {
			header_position = 0;
		}
	}

  let showSplash = true; // Toggle splash during development
  let preloadReady = false;
  let imageLoadTracker = 0, videoLoadTracker=0, imageLoadPercentage=2, videoLoadPercentage=2;
  let splashVideo, heroVideo, videosPaused=false;
  let videosReady = false
  let r;

  let windowWidth = 0
  let flipbookLength = 31
  let flipbook = []
  let productFlipbookSets = {}

  let entranceManager, resetManager;

  let headerIsBlack = false

  const preloadImageUrls = products.map(product => {
    const productImages = []
    for (let i=0;i<flipbookLength;i++) {
      productImages.push(
        {
          src: `/products/${product.id}/flipbook/desktop/${product.filePrefix}${i< 10 ? "0"+i : i}.png`,
          mobile: false,
        }
      )
      productImages.push(
        {
          src: `/products/${product.id}/flipbook/mobile/${product.filePrefix}${i< 10 ? "0"+i : i}.png`,
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

  const preloadVideoUrls = products.map(product => {
    return [
      `/products/${product.id}/product-bg.mp4`
    ];
  }).flat()

  function handleVideoPause(){
    if (videosPaused) {
      document.querySelectorAll("video").forEach(video => video?.play())
      videosPaused=false
    } else {
      document.querySelectorAll("video").forEach(video => video?.pause())
      videosPaused=true
    }
  }

  function updateImageLoadProgress(){
    imageLoadTracker ++
    imageLoadPercentage = Math.floor(50*(imageLoadTracker/preloadImageUrls.length))
  }

  function updateVideoLoadProgress(videos) {
    const totalVideos = videos.length;

    // Function to update the count of ready videos
    function checkVideos() {
        for (let i = 0; i < totalVideos; i++) {
            const video = videos[i];

            // Check if the video is ready to play (can play or has loaded enough data)
            if (video.readyState >= 3 && !video.isReady) {
                video.isReady = true; // Mark video as ready
                videoLoadTracker++;
                videoLoadPercentage = Math.floor(50*(videoLoadTracker/totalVideos))

                video.pause()
                // If all videos are ready, stop the interval
                if (videoLoadTracker === totalVideos) {
                    clearInterval(interval);
                }
            }
        }
    }

    // Set an interval to check every 500ms for video readiness
    const interval = setInterval(checkVideos, 500);
  }

  onMount(()=> {
    timer.start() // Countdown clock in header

    // To use the Image class, this needs to be done in onMount
    // However, these images have already been preloaded in the preload phase
    products.forEach(product => {
      // Do the window query here
      productFlipbookSets[product.id] = []
      for (let i = 0; i < flipbookLength; i++) {
        if (window.innerWidth < 768) {
          productFlipbookSets[product.id].push(new Image(800,800))
          productFlipbookSets[product.id][i].src = `/products/${product.id}/flipbook/mobile/${product.filePrefix}${i< 10 ? "0"+i : i}.png`
        } else {
          productFlipbookSets[product.id].push(new Image(1920,1920))
          productFlipbookSets[product.id][i].src = `/products/${product.id}/flipbook/desktop/${product.filePrefix}${i< 10 ? "0"+i : i}.png`

        }
      }
    })

    entranceManager = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if(entry.intersectionRatio>=0.9) {
            handleOnScreen(entry)
          } else {
            handleEntrance(entry)
          } 
        } else {
          handleExit(entry)
        }
      });
    }, {
      threshold: [animThreshold, onScreenThreshold]
    });
    resetManager = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        console.log("RESET MANAGER FIRES!!!")
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          console.log("Resetting scene", entry.intersectionRatio)
          resetScene()
        }
      });
    }, {
      threshold: [0, 1]
    });
    resetManager.observe(document.querySelector("[data-scroll-reset]"))

    // Turn header text black when over non-video part of hero
    entranceManager.observe(document.querySelector("[data-header-black]"))

    // Turn it white again when it's over the scroll scene
    entranceManager.observe(document.querySelector("[data-header-white]"))

    // Handle scroll events in scroll sequence:
    document.querySelectorAll("[data-scroll-node]").forEach((node) => {
      entranceManager.observe(node)
    })

    updateVideoLoadProgress(document.querySelectorAll("video"))

    const loadFallback = setTimeout(()=>{
      onPreloadComplete()
      clearTimeout(loadFallback)
    },5000)
  })

  function onPreloadComplete(){

    // Ensure it doesnt fire twice if the preload completes after the loadFallback has already fired
    if (preloadReady) return;
    // Use requestAnimationFrame to animate the load percentage the rest of the way to 100%:
    if (document.querySelector("[data-load-percentage]")) {
      let loadPercentage = parseInt(document.querySelector("[data-load-percentage]").textContent)
      function animateLoadPercentage() {
        if (loadPercentage < 100) {
          loadPercentage++
          document.querySelector("[data-load-percentage]").textContent = loadPercentage
          requestAnimationFrame(animateLoadPercentage)
        } else {
        preloadReady = true;
        showSplash ? splashVideo?.play() : heroVideo?.play()
        if (!showSplash) {
          document.querySelector(".hero").classList.add("entered")
          document.querySelector("svelte-scroller-outer").classList.add("entered")
          document.documentElement.style.overflow="unset"
        }
        heroVideo.scrollIntoView()        
      }
      }
      requestAnimationFrame(animateLoadPercentage)
    }
    // preloadReady = true;
    // showSplash ? splashVideo?.play() : heroVideo?.play()
    // if (!showSplash) {
    //   document.querySelector(".hero").classList.add("entered")
    //   document.querySelector("svelte-scroller-outer").classList.add("entered")
    //   document.documentElement.style.overflow="unset"
    // }
    // heroVideo.scrollIntoView()
  }

  function handleSplashEnd(){
    heroVideo.play(); 
    splashVideo.parentElement.remove();
    document.documentElement.style.overflow="unset";
    window.scrollTo(0, 0)
    if (showSplash) {
      document.querySelector(".hero").classList.add("entered");
      document.querySelector("svelte-scroller-outer").classList.add("entered");
    }
  }

  // Remove preload screen:
  $: {
    // only half of the flipbook images (either desktop or mobile) are loaded, so multiply by 2
    if (imageLoadTracker*2 === (preloadImageUrls.length) && videoLoadTracker === (preloadVideoUrls.length+(showSplash ? 3 : 2))) {
      onPreloadComplete()
    }
  }

  let 
    scrollContainer, 
    index, 
    offset, 
    progress,

    animThreshold = 0.1, 
    onScreenThreshold=0.9, 
    sectionsPerProduct=5,
    bgZoom = 1.5, 
    textEnterSpeed=30,
    productImageEnterSpeed=30;

    function drawImageScaled(img, ctx) {
      var canvas = ctx.canvas;
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;
      // Calculate the scaling ratio based on the height of the canvas
      var scaleRatio = canvasHeight / img.height;

      // Calculate the new width while maintaining the aspect ratio
      var newWidth = img.width * scaleRatio;

      // Calculate the offset to center the image horizontally
      var centerShiftX = (canvasWidth - newWidth) / 2;

      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw the image with the adjusted width and height
      ctx.drawImage(
          img,
          0, 0, img.width, img.height,  // Source dimensions
          centerShiftX, 0, newWidth, canvasHeight  // Destination dimensions
      );
    }
    function handleEntrance(entry){

      if (entry.target.dataset.flipbookId) {
        debounce(() => {
          console.log("Debounced.")
          const flipbook = productFlipbookSets[entry.target.dataset.flipbookId]
          let reverse = false

          if (entry.target.classList.contains("flipbook-entered")) reverse = true
            const productCanvas = document.querySelector(`[data-product-canvas="${entry.target.dataset.flipbookId}"]`)
            const canvas_context = productCanvas.getContext('2d');
            const canvas_width = productCanvas.clientWidth;
            const canvas_height = productCanvas.clientHeight;
            // Use setInterval to draw image to the flipbook canvas until flipbookLength has been reached:
            if (reverse) {
              let i = flipbookLength-1;
              const flipbookInterval = setInterval(()=>{
                if (i >= 0) {
                  canvas_context.clearRect(0, 0, canvas_width, canvas_height);
                  drawImageScaled(flipbook[i], canvas_context)
                  i--
                } else {
                  clearInterval(flipbookInterval)
                }
              }, productImageEnterSpeed)
              entry.target.classList.remove("flipbook-entered")
            } else {
            let i = 0;
            const flipbookInterval = setInterval(()=>{
              if (i < flipbookLength) {
                canvas_context.clearRect(0, 0, canvas_width, canvas_height);
                drawImageScaled(flipbook[i], canvas_context)
                i++
              } else {
                clearInterval(flipbookInterval)
              }
            }, productImageEnterSpeed)
            entry.target.classList.add("flipbook-entered")
          }
        },200)()
        
      } else if (entry.target.dataset.lifestyleBg) {
        // entry.target.querySelector("video").play()
      } else if (entry.target.dataset.productVideo) {
        // Play fixed video background which is outside scroller
        if (!videosPaused) document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"] video`).play()
        document.querySelector(`[data-product-bg="${entry.target.dataset.productVideo}"]`).classList.add("entered")
      } else if (entry.target.dataset.headerBlack) {
        headerIsBlack = true
        document.querySelector("[data-scroll-prompt]").classList.add("hidden")

      } else if (entry.target.dataset.headerWhite) {
        headerIsBlack = false
      }
      entry.target.classList.add("entered");  
    }

    function handleOnScreen(entry) {
      if (entry.target.dataset.lifestyleBg) {
        // When the lifestyle background is on screen, animate in the lifestyle text
        Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
          setTimeout(() => {
            char.classList.add("entered")
          }, i*textEnterSpeed)
        })

        // document.querySelector(`[data-product-bg="${entry.target.dataset.productText-1}"]`)?.pause()
      } else if (entry.target.dataset.productText) {
        // Ensure lifestyle video is paused:
        // document.querySelector(`[data-lifestyle-bg="${entry.target.dataset.productText}"]`).querySelector("video").pause()
        // Once the container for the product text is fully on screen, animate in the text
        Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
          setTimeout(() => {
            char.classList.add("entered")
          }, i*textEnterSpeed)
        })
      }
    }
    function handleExit(entry){
    }

    function prepareCanvasForFlipbook(canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.round (r * rect.right) - Math.round (r * rect.left);
      canvas.height = Math.round (r * rect.bottom) - Math.round (r * rect.top);
      canvas.style.transform = `scale3d(${1/r},${1/r},1)`;
      canvas.style.transformOrigin = "top left";

      // canvas.width = canvas.parentElement.clientWidth;
      // canvas.height = canvas.parentElement.clientHeight;

      // Try out removing anti-aliasing?
      // const ctx = canvas.getContext('2d');
      // ctx.webkitImageSmoothingEnabled = false;
      // ctx.mozImageSmoothingEnabled = false;
      // ctx.imageSmoothingEnabled = false;
    }

// update background scales based on scroll position
    function calculateLifestyleBgScale(productIndex){
      // special case for the first lifestyle background bc it is the only one where a negative offset is possible:
      if (productIndex == 0) return offset < 0 ? 1-(offset/2) : 1
      return (index==productIndex*sectionsPerProduct-1) ? 1.33-(offset/3) : 1
    }
    function calculateProductBgScale(productIndex){
      return (index==productIndex*sectionsPerProduct) ? 1.33-(offset/3) : 1
    }

    function handleResize(){
      document.querySelectorAll("[data-product-canvas]").forEach((canvas) => {
        prepareCanvasForFlipbook(canvas)
      })
    }
    // Wrap handleResize in a debounce function to prevent it from firing too often:
    function debounce(func, wait=200, immediate) {
      let timeout;
      return function() {
        const context = this, args = arguments;
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };


    function resetScene() {
      // Instant scroll to top:
      window.scrollTo(0, 40)


      // Remove all entrances AND reset flipbook canvases
      document.querySelector(".foreground-slot").querySelectorAll(".entered").forEach((el) => {
        el.classList.remove("entered")
      })
      document.querySelector(".foreground-slot").querySelectorAll(".flipbook-entered").forEach((el) => {
        el.classList.remove("flipbook-entered")
      })
      document.querySelectorAll("[data-product-canvas]").forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      })
    }
</script>

<svelte:head>

  {#each preloadImageUrls as image, i}
    {#if image.mobile}
      <link rel="preload" as="image" media="(max-width: 768px)" href={image.src} onload={updateImageLoadProgress} />
    {:else}
      <link rel="preload" as="image" media="(min-width: 768px)" href={image.src} onload={updateImageLoadProgress} />
    {/if}
  {/each}
</svelte:head>

<div class="h-dvh w-full flex items-end fixed justify-between inset-0 bg-[#fff] z-[60] p-8" class:hide-preload={preloadReady}>
  <p style="font-family: 'NH Display Medium';" class=""><span data-load-percentage>{(videoLoadPercentage+imageLoadPercentage)}</span>%</p>
  <p class="block !w-fit whitespace-nowrap animate-pulse">Preparing the senses</p>
</div>
<aside class="fixed top-[-1px] w-full h-[40px] z-30 flex justify-center items-center translate-y-[var(--pos)] will-change-transform transition-transform duration-300" style="background-image: url(touchland-gradient.png); background-size: cover; --pos: {header_position}%;">
  <a href="https://anewera.touchland.com/" class="flex items-center gap-2">
    <span class="underline text-[12px]">Enter the Move Your Mood Sweeps</span>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0787 6.5L-6.55671e-07 6.5L-5.68248e-07 7.5L12.0788 7.5L6.2865 13.2922L7 14L14 7L7 -6.11959e-07L6.2865 0.707749L12.0787 6.5Z" fill="black"/>
    </svg>
  </a>
</aside>
<header class="fixed top-[40px] w-full z-30 flex justify-between items-center p-2 md:px-8 md:py-4 translate-y-[var(--pos)] will-change-transform transition-transform duration-300" class:is-black={headerIsBlack} style=" --pos: {header_position}%;">
  <div class="w-fit">
    <a href="https://www.touchland.com" target="_blank" class="w-[120px] md:w-[110px] block">
      <svg class="w-full" viewBox="0 0 100 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_406_812)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M46.6484 7.79002V15.58H49.4374V12.5712C49.4374 10.7887 49.4509 9.44183 49.471 9.26423C49.5449 8.6109 49.7499 8.16191 50.1599 7.7565C50.6068 7.30751 51.1007 7.10313 51.7392 7.10313C52.7304 7.10313 53.3924 7.62248 53.6377 8.59413C53.7553 9.05646 53.7721 9.51886 53.7721 12.588V15.58H56.598L56.588 12.0351C56.5745 8.50697 56.5745 8.49364 56.4972 8.07482C56.3258 7.13998 55.9999 6.41627 55.5059 5.87349C55.1632 5.49822 54.6155 5.15647 54.0644 4.97889C53.4663 4.78456 52.5759 4.71085 51.9744 4.80132C51.0604 4.94539 50.2103 5.34745 49.7129 5.88018L49.5047 6.10132L49.4979 3.05904L49.4878 0.0167527L48.0698 0.00670352L46.6484 0V7.79002Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M96.1885 0.0234562C96.1281 0.0402088 96.1243 0.120619 96.1411 3.05234L96.1579 6.06447L95.9363 5.85338C94.9117 4.87168 93.4094 4.50312 91.8743 4.86162C90.842 5.09951 89.851 5.6892 89.2298 6.43302C88.3557 7.47839 87.9362 8.74827 87.9362 10.3431C87.9362 12.0452 88.4634 13.3954 89.5454 14.4743C90.3049 15.2315 91.1209 15.6738 92.1227 15.8681C92.5093 15.9452 93.2788 15.9452 93.7021 15.8715C94.6159 15.7073 95.4626 15.2483 95.9363 14.6619C96.0341 14.5413 96.1182 14.4475 96.1243 14.4542C96.138 14.4676 96.2358 15.4225 96.2358 15.5365C96.2358 15.5699 96.5109 15.58 97.4958 15.58H98.7558V10.829C98.7558 8.2189 98.7459 4.7142 98.7322 3.03893L98.7123 0L97.4821 0.00334971C96.8066 0.00670024 96.2221 0.0167551 96.1885 0.0234562ZM93.7861 7.15339C94.3676 7.2405 94.784 7.43818 95.1875 7.82012C95.7751 8.37295 96.0746 9.10674 96.1212 10.1019C96.1747 11.1707 95.8561 12.1356 95.2578 12.732C94.875 13.1106 94.4845 13.315 93.9237 13.4222C92.3916 13.7171 91.0308 12.7756 90.6174 11.1338C90.5532 10.8859 90.5433 10.7518 90.5433 10.2862C90.5471 9.80031 90.557 9.69311 90.6342 9.39825C90.9498 8.20884 91.8102 7.34772 92.8723 7.15674C93.2077 7.09307 93.3964 7.09307 93.7861 7.15339Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M59.2109 7.84111V15.6478H60.5886H61.9663V7.84111V0.0343628H60.5886H59.2109V7.84111Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.48239 2.335C2.47903 2.58964 2.47567 2.9917 2.47231 3.23294C2.46222 3.92315 2.31438 4.34867 1.975 4.63681C1.62554 4.93501 1.3164 5.02547 0.654442 5.02547H0.00256348V7.33734H2.35134L2.36142 10.1753L2.3715 13.0165L2.46559 13.3516C2.90242 14.9531 4.0852 15.7807 5.93331 15.7807C6.26261 15.7807 6.48775 15.7606 6.72632 15.7137C7.05562 15.6467 7.77807 15.4088 7.87886 15.335C7.92929 15.2982 7.89903 15.191 7.58317 14.2729C7.39164 13.71 7.21691 13.2108 7.19675 13.1606L7.16314 13.0701L7.02874 13.1371C6.35334 13.4621 5.49313 13.2745 5.20079 12.7384C4.99246 12.3564 4.99581 12.4101 4.98237 9.75644L4.97229 7.33734H7.4958V5.02547H4.97566V1.87598H2.48911L2.48239 2.335Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M38.8662 4.64106C36.8568 4.95601 35.086 6.46375 34.4308 8.42047C34.209 9.08051 34.1653 9.37872 34.1653 10.203C34.162 11.0372 34.209 11.4091 34.3972 12.0625C35.1398 14.6324 37.4079 16.187 40.1162 15.9826C42.0114 15.8385 43.4865 14.9707 44.3904 13.463C44.5483 13.2017 44.7566 12.7661 44.8104 12.5785C44.8306 12.5148 44.7533 12.4846 43.6142 12.1295C42.9421 11.9217 42.3777 11.7442 42.3541 11.7342C42.3306 11.7274 42.2634 11.8212 42.1996 11.9519C41.7257 12.8868 40.7715 13.4529 39.6727 13.4496C38.6142 13.4462 37.6935 12.8599 37.2029 11.8782C36.6283 10.7323 36.6754 9.44569 37.3239 8.47068C37.875 7.64645 38.7486 7.17071 39.7029 7.17071C40.2775 7.17071 40.7009 7.28798 41.131 7.56273C41.4905 7.79388 41.9106 8.24623 42.1424 8.65164C42.1996 8.75884 42.2667 8.846 42.2835 8.846C42.3239 8.846 44.7063 8.14573 44.7231 8.12562C44.7499 8.10215 44.4442 7.4287 44.293 7.17406C43.4159 5.70652 42.1458 4.86219 40.4757 4.64106C40.0355 4.58075 39.2358 4.58075 38.8662 4.64106Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M68.8016 4.67287C68.1866 4.72313 67.5213 4.87055 67.0374 5.06824C66.3016 5.36643 65.4548 6.04324 65.0449 6.65639C64.7593 7.07855 64.4938 7.72519 64.5711 7.80229C64.5879 7.81906 65.0851 7.96976 65.6766 8.14066C66.268 8.3082 66.7686 8.45228 66.7854 8.46233C66.8056 8.46904 66.8459 8.39529 66.8828 8.29814C67.0341 7.85921 67.3466 7.44712 67.6994 7.21258C67.807 7.14222 68.022 7.0417 68.1799 6.98474C68.4386 6.89427 68.5059 6.88422 68.9024 6.88422C69.8466 6.87753 70.5892 7.21928 70.8681 7.77883C71.0495 8.14736 71.0697 8.64999 70.9185 8.94142C70.8715 9.02858 70.8547 9.03529 70.5421 9.0554C69.4534 9.12908 68.4454 9.24298 67.6423 9.377C65.7975 9.69197 64.7122 10.486 64.3796 11.7727C64.2787 12.158 64.2552 12.8213 64.3291 13.2067C64.6047 14.6642 65.6799 15.6157 67.2995 15.8469C67.4743 15.8703 67.7969 15.8804 68.1564 15.867C68.6302 15.8536 68.7915 15.8369 69.0637 15.7665C69.8197 15.5655 70.5489 15.0997 71.0596 14.4899L71.194 14.3291L71.2142 14.6072C71.2276 14.7613 71.2478 15.0428 71.2579 15.2304L71.2814 15.5755H72.5885C73.8183 15.5755 73.8956 15.5721 73.8788 15.5152C73.8721 15.485 73.8553 13.9036 73.8418 12.0072C73.8318 10.1074 73.8082 8.40199 73.7881 8.21106C73.6436 6.7033 72.5717 5.477 70.9117 4.92416C70.3707 4.74323 69.3963 4.62597 68.8016 4.67287ZM71.2545 11.2868C71.3083 11.5951 71.1974 12.1044 70.9958 12.5064C70.8076 12.8817 70.3909 13.2938 70.0112 13.4882C69.5139 13.7394 69.0939 13.8399 68.5361 13.8366C67.8002 13.8332 67.2761 13.5618 67.0374 13.0593C66.8762 12.7175 66.8728 12.2517 67.0273 11.9402C67.0979 11.7995 67.3331 11.5615 67.4743 11.4879C67.9145 11.2634 68.2807 11.2165 69.776 11.1896C70.4783 11.1762 71.0932 11.1628 71.1436 11.1595C71.2209 11.1528 71.2343 11.1662 71.2545 11.2868Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0065 4.74111C12.2088 5.03261 10.6732 6.14498 9.87011 7.7398C9.24172 8.9862 9.11403 10.504 9.51725 11.8844C10.1154 13.935 11.819 15.4829 13.9024 15.8683C14.4164 15.9654 15.485 15.9587 15.9924 15.8548C18.2639 15.3992 20.0246 13.5832 20.4412 11.2713C20.5287 10.7988 20.5455 9.86072 20.4749 9.43184C20.0985 7.06973 18.4151 5.28725 16.0865 4.79137C15.6429 4.6942 14.4635 4.6674 14.0065 4.74111ZM15.6664 7.17025C16.6946 7.45839 17.5146 8.3094 17.8068 9.39832C17.8842 9.68982 17.8943 9.80045 17.8976 10.2527C17.901 11.02 17.7767 11.5159 17.4272 12.1089C17.2458 12.4139 16.8257 12.8527 16.5267 13.0504C15.6799 13.5999 14.5845 13.6636 13.6637 13.218C12.7969 12.7992 12.2256 12.0285 11.9971 10.9731C11.9736 10.8592 11.9534 10.5576 11.9568 10.2695C11.9568 9.66971 12.0273 9.34475 12.2592 8.84883C12.6926 7.92746 13.4689 7.31097 14.44 7.11664C14.7625 7.05298 15.3405 7.07979 15.6664 7.17025Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M81.4452 4.77455C81.0861 4.83151 80.7033 4.95883 80.3938 5.11965C79.9002 5.37765 79.3356 5.87017 78.9994 6.3292L78.8481 6.53693L78.8381 5.79646L78.8312 5.05934H76.3112V15.58H78.9291L78.942 12.655C78.9558 9.47872 78.952 9.54569 79.1537 8.90577C79.3088 8.4132 79.5166 8.06478 79.8559 7.71964C80.3365 7.23384 80.7469 7.07637 81.4116 7.11657C82.7389 7.19699 83.2936 7.74646 83.4311 9.13023C83.4548 9.36474 83.4686 10.5743 83.4686 12.5378V15.58H86.1636L86.1468 12.1859C86.1361 9.95446 86.1193 8.6679 86.0925 8.42661C86.0352 7.89724 85.9351 7.35781 85.8373 7.05962C85.4644 5.91709 84.5437 5.11631 83.2669 4.81811C82.884 4.73099 81.8686 4.70419 81.4452 4.77455Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M29.4578 8.35095L29.4477 11.7116L29.3738 11.9293C29.263 12.2543 29.0714 12.5525 28.806 12.8139C28.5271 13.092 28.2414 13.2696 27.8685 13.3935C27.6332 13.4706 27.5425 13.4806 27.1628 13.484C26.8436 13.484 26.6688 13.4672 26.5076 13.4237C25.8087 13.2327 25.3382 12.7402 25.1232 11.9729C25.0493 11.7116 25.0459 11.6981 25.0358 8.36771L25.0257 5.02724H22.2401V8.27392C22.2401 10.2206 22.2536 11.6914 22.2737 11.9494C22.3174 12.4922 22.4081 12.9311 22.5627 13.3734C22.7811 14.0066 23.0332 14.4255 23.4297 14.8409C24.1185 15.5513 24.9821 15.883 26.1581 15.883C26.6991 15.883 27.0217 15.8461 27.4619 15.7322C28.2919 15.5211 29.1218 14.9951 29.4176 14.4925C29.4645 14.4088 29.5116 14.3417 29.515 14.3484C29.5217 14.3551 29.5419 14.5829 29.562 14.861C29.5855 15.1358 29.609 15.4139 29.6191 15.4742L29.6359 15.5814H32.2199V4.99374H29.4679L29.4578 8.35095Z" fill="currentColor"/>
        </g>
        <defs>
        <clipPath id="clip0_406_812">
        <rect width="99.3333" height="16" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    </a>
  </div>
  <div class="util flex gap-4 md:gap-8">
    {#if preloadReady}<div>{$time.find(t=>t.type==="day").value}:{$time.find(t=>t.type==="hour").value}:{$time.find(t=>t.type==="minute").value}:{$time.find(t=>t.type==="second").value}</div>{/if}
    <a href="/" class="anim-underline-always" onclick={openWaitlistCapture}>Join the Waitlist</a>
  </div>
</header>

<button class="fixed bottom-4 left-4 flex items-center justify-center w-8 h-8 bg-[rgba(0,0,0,0.2)] rounded-full z-[40]" onclick={handleVideoPause}>
  {#if videosPaused}
    <span class="text-white">▶</span>
  {:else}
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="14" fill="white"/>
      <rect x="7" width="1" height="14" fill="white"/>
    </svg>
  {/if}
</button>

<aside class:accepted={cookiesAccepted} class="fixed bottom-4 left-4 z-[50] right-4 md:right-unset md:max-w-[280px] rounded-xl flex flex-col gap-2 bg-white p-4 drop-shadow">
  <h3 class="font-bold text-[20px]">Cookies Consent</h3>
  <p class="!text-[10px]">We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content.</p> 
  <p class="!text-[10px]">By clicking 'Accept,' you agree to our use of cookies. You can manage your preferences or learn more in our <a href="https://touchland.com/pages/privacy-policy" target="_blank" class="underline">Privacy Policy</a>.</p>
  <div class="flex gap-4">
    <a href="https://touchland.com/pages/privacy-policy" class="border border-black rounded-md flex items-center justify-center basis-full py-[8px] uppercase text-[12px]">Decline</a>
    <button onclick={handleCookieAccept} class="border border-black rounded-md flex items-center justify-center basis-full py-[8px] bg-black text-white uppercase hover:bg-white hover:text-black transition-colors text-[12px]">Accept</button>
  </div>
</aside>

<!-- Splash video; removed after it plays -->
{#if showSplash && windowWidth > 768}
  <div class="fixed inset-0 bg-[#0f0] z-40">
    <video class="w-full h-full object-cover" bind:this={splashVideo} muted autoplay playsinline preload="auto" onended={handleSplashEnd} aria-label="Text scrolls across the screen reading 'I want to feel transported' in all caps, followed by a quick succession of product images, showing the body mist capsules in front of vivid backgrounds of ingredients used in each fragrance.">
        <source src="/videos/splash-desktop.mp4" type="video/mp4" />
    </video>
  </div>
{:else if showSplash}
  <div class="fixed inset-0 bg-[#0f0] z-40">
    <video class="w-full h-full object-cover" bind:this={splashVideo} muted autoplay playsinline preload="auto" onended={handleSplashEnd} aria-label="Text scrolls across the screen reading 'I want to feel transported' in all caps, followed by a quick succession of product images, showing the body mist capsules in front of vivid backgrounds of ingredients used in each fragrance.">
        <source src="/videos/splash-mobile.mp4" type="video/mp4" />
    </video>
  </div>
{/if}

<div class="experience-container">
  <div class="hero w-full h-screen md:h-[50vw] bg-[#fff] relative z-20">
    <div class="w-full h-1/2 md:h-auto md:aspect-square md:w-1/2 md:ml-[50%] object-cover relative mt-[39px]">
      {#if windowWidth > 768}
      <video class="w-full h-full object-cover" bind:this={heroVideo} loop muted autoplay playsinline preload="auto">
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>
      {:else}
      <video class="w-full h-full object-cover" bind:this={heroVideo} loop muted autoplay playsinline preload="auto">
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
      </video>
      {/if}
    </div>
      
      <div class="w-full min-h-[50vh] p-8 md:w-[50vw] md:h-screen md:fixed md:top-0 bg-[#fff] flex flex-col  md:justify-center gap-[12px]">
        <div class="relative">
          <div class="new-label">New</div>
          <h1>Meet Power Essence.</h1>
        </div>
        <p>Skincare-infused body & hair fragrance mist designed to move your mood.</p>
        <button class="cta-btn" onclick={openWaitlistCapture}>Join the waitlist</button>

      </div>
      <div class="w-full h-[80px] bg-transparent absolute bottom-[50vh] pointer-events-none" data-header-black="black"></div>
      <div class="w-full h-[80px] bg-transparent pointer-events-none" data-header-white="white"></div>
      <button data-scroll-prompt aria-label="Begin Scroll" class="fixed bottom-4 right-4" onclick={()=>{scrollContainer.scrollIntoView({behavior:"smooth",block:"start"})}}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_406_643)">
          <rect x="36" width="36" height="36" rx="18" transform="rotate(90 36 0)" fill="black"/>
          <path d="M18.5714 23.8043L18.5714 10L17.4286 10L17.4286 23.8043L10.8089 17.1846L10 18L18 26L26 18L25.1911 17.1846L18.5714 23.8043Z" fill="white"/>
          </g>
          <defs>
          <clipPath id="clip0_406_643">
          <rect x="36" width="36" height="36" rx="18" transform="rotate(90 36 0)" fill="white"/>
          </clipPath>
          </defs>
          </svg>          
      </button>
  </div>
</div>

<svelte:window 
  on:resize={debounce(handleResize, 200)}
  on:scroll={handleScroll}
	bind:scrollY={windowScrollY}
  bind:innerWidth={windowWidth}
  bind:devicePixelRatio={r}
/>
<!-- Product Background Videos -->
{#each products as product, i}
    <!-- This is kind of janky but the first section IS an edge case so it's ultimately easier to treat it as such -->
      {#if i==0}
        <div style="visibility:{(index > (i*sectionsPerProduct) || (index==(i*(sectionsPerProduct-1)) && offset>0.2)) ? "visible":"hidden"};" data-product-bg={i+1} class="w-full h-screen top-0 left-0 bottom-0 right-0 object-cover origin-top fixed md:w-[50vw] md:right-0 md:left-1/2" alt="">
          <video class="w-full h-full object-cover" loop muted autoplay playsinline preload="auto">
            <source src="/products/{product.id}/product-bg.mp4" type="video/mp4" />
          </video>
        </div>
      {:else}
        <div style="visibility:{(index > (i*sectionsPerProduct) || (index==(i*(sectionsPerProduct)) && offset>0.2)) ? "visible":"hidden"};" data-product-bg={i+1} class="w-full h-screen top-0 left-0 bottom-0 right-0 object-cover origin-top fixed md:w-[50vw] md:right-0 md:left-1/2" alt="">
          <video class="w-full h-full object-cover" loop muted autoplay playsinline preload="auto">
            <source src="/products/{product.id}/product-bg.mp4" type="video/mp4" />
          </video>
        </div>
      {/if}
    {/each}
<!-- Scroller -->
<Scroller top={animThreshold} bottom={animThreshold} threshold={animThreshold} bind:index bind:offset bind:progress>
  <div slot="background">
  </div>
  <div class="foreground-slot" slot="foreground" bind:this={scrollContainer}>
    {#each products as product, i}

      <!-- Lifestyle Background -->
      <section data-scroll-node data-lifestyle-bg={i+1} class="sticky top-0 z-20 overflow-hidden" style="visibility:{index > ((i*sectionsPerProduct)) ? "hidden":"visible"};">
        <div class="image-mask w-full overflow-hidden relative" style="height: {index > ((i*sectionsPerProduct-1)) ? (offset>0.2 ? (100*(1-((offset*100)-20)/80)) : 100) : 100}%;)"> 
          <div class="absolute top-0 left-0 w-screen h-screen md:w-[50vw] z-20 flex items-center justify-center">
            <h2 class="font-serif uppercase text-[#FFF]">
              {#each product.lifestyleText as char}
                <span class="typewriter-char">{char}</span>
              {/each}
            </h2>
          </div>
          <div class="img-wrapper relative w-screen h-screen md:w-[50vw]">
            {#if windowWidth > 768}
            <img src="/products/{product.id}/lifestyle-bg.jpg" class="w-full h-full object-cover object-center object-top" alt="">
            {:else}
              <img src="/products/{product.id}/lifestyle-bg-mobile.jpg" class="w-full h-full object-cover object-center object-top" alt="">
            {/if}
          </div>
        </div>
        <!-- What does this do -->
        <div data-product-bg-trigger={i+1} data-scroll-node class="w-full bg-transparent absolute bottom-0 h-[10%]"></div>
      </section>

      <!-- Product Background Trigger -->
      <section data-scroll-node data-product-video={i+1}></section>

      <!-- Product Text -->
      <section data-scroll-node class="sticky top-0 flex items-center justify-center text-[#fff] {i===0 && "pre-entered"}" style="visibility:{index > ((i*sectionsPerProduct+4)) ? "hidden":"visible"};">
        <h2 data-product-text={i+1} class="font-serif uppercase text-[24px]">
          {product.productText}
        </h2>
        <canvas use:prepareCanvasForFlipbook data-product-canvas={product.id} class="absolute inset-0"></canvas>
      </section>

        <section class="sticky top-0">
          <div class="absolute top-1/2 -transform-y-1/2 w-full h-[100px]" data-scroll-node data-flipbook-id={product.id} data-flipbook-entrance={i+1}></div>
        </section>

<!-- spacer -->
        <section data-scroll-node></section>
    {/each}

    <section data-scroll-reset class="relative z-20 !h-[calc(100vh-20px)] overflow-hidden">
      <div class="w-full h-1/2 md:h-auto md:aspect-square object-cover relative z-20">
        {#if windowWidth > 768}
        <video class="w-full h-full object-cover" loop muted autoplay playsinline preload="auto">
            <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>
        {:else}
        <video class="w-full h-full object-cover" loop muted autoplay playsinline preload="auto">
            <source src="/videos/hero-mobile.mp4" type="video/mp4" />
        </video>
        {/if}
      </div>

      <div class="md:hidden w-full h-[50vh] p-8 bg-[#fff] flex flex-col justify-center gap-[12px] relative z-20">
        <div class="relative">
          <div class="new-label">New</div>
          <h1>Meet Power Essence.</h1>
        </div>
        <p>Skincare-infused body & hair fragrance mist designed to move your mood.</p>
        <button class="cta-btn" onclick={openWaitlistCapture}>Join the waitlist</button>
        <button aria-label="Begin Scroll" class="absolute bottom-8 right-8 md:hidden">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_406_643)">
            <rect x="36" width="36" height="36" rx="18" transform="rotate(90 36 0)" fill="black"/>
            <path d="M18.5714 23.8043L18.5714 10L17.4286 10L17.4286 23.8043L10.8089 17.1846L10 18L18 26L26 18L25.1911 17.1846L18.5714 23.8043Z" fill="white"/>
            </g>
            <defs>
            <clipPath id="clip0_406_643">
            <rect x="36" width="36" height="36" rx="18" transform="rotate(90 36 0)" fill="white"/>
            </clipPath>
            </defs>
            </svg>          
        </button>
      </div>

      <div class="relative"> 
        <div class="w-screen h-screen md:w-[50vw]">
          {#if windowWidth > 768}
          <img style="transform: scale(1.8) translateY(10%);" src="/products/{products[0].id}/lifestyle-bg.jpg" class="w-full h-full object-cover object-center object-top" alt="">
          {:else}
            <img style="transform: scale(1.8) translateY(10%);" src="/products/{products[0].id}/lifestyle-bg-mobile.jpg" class="w-full h-full object-cover object-center object-top" alt="">
          {/if}
        </div>
      </div>
    </section>
  </div>
</Scroller>

<style>

  .accepted {
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
    transition: all 0.3s;
  }
  .hide-preload {
    display: none;
  }

  :root {
    overflow: hidden;
  }

  .foreground-slot section {
    height: 100vh;
  }
  [data-scroll-node] .img-wrapper::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.05);
  }
  [data-product-bg]::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.1);
  }
  @media (min-width: 768px) {
    .foreground-slot section {
      width: 50%;
      margin-left: 50%;
    }
  }

  :global([data-lifestyle-bg] .image-mask) {
    transform-origin: top center;
  }
  :global([data-lifestyle-bg] img) {
    transform: scale(1.8) translateY(10%);
    transition: transform ease 2s;
  }
  :global([data-lifestyle-bg].entered img) {
    transform: scale(1) translateY(0%);
  }

  :global([data-product-bg] video) {
    transform: scale(1.8) translateY(10%);
    transition: transform ease 2s;
  }
  :global([data-product-bg].entered video) {
    transform: scale(1) translateY(0%);
  }

  :global(.typewriter-char) {
    opacity: 0;
  }
  :global(.typewriter-char.entered) {
    opacity: 1;
  }

  :global(.hero > *) {
    transform: translateY(40px);
    opacity: 0;
    transition: all 0.6s ease-in-out
  }
  :global(.hero.entered > *) {
    transform: translateY(0px);
    opacity: 1;
    transition-delay: 0.2s;
  }
  :global(svelte-scroller-outer) {
    transform: translateY(40px);
    opacity: 0;
    transition: all 0.6s ease-in-out
  }
  :global(svelte-scroller-outer.entered) {
    transform: translateY(0px);
    opacity: 1;
    transition-delay: 0.2s;
  }
  header {
    color: white;
    background: transparent;
    transition: all 0.3s;
  }
  header.is-black {
    color: black;
    transition: all 0.3s;
  }
  header .util {
    font-size: 12px;
    font-family: "NH Text Regular";
  }
  @media (min-width: 768px) {

    header .util, header.is-black .util {
      color: white;
    }
    header svg, header.is-black svg {
      color: black;
    }
  }
  h1 {
    font-family: "Moulin";
    text-transform: uppercase;
    font-size: 32px;
    letter-spacing: 0;
    line-height: 1;
  }
  h2 {
    font-family: "Moulin";
    text-transform: uppercase;
    font-size: 24px;
    letter-spacing: 0;
    line-height: 1;
  }
  .new-label {
    font-family: "NH Display Regular";
    background: black;
    text-transform: uppercase;
    color: white;
    width: fit-content;
    font-size: 12px;
    padding: 3px 6px;
    margin-bottom: 12px;
  }

  p {
    font-family: "NH Display Regular";
    font-size: 20px;
    line-height: 120%;
  }
  .hero p {
    width: 90%;
  }
  @media (min-width: 768px) {
    .hero p {
      width: 50%;
    }
    .new-label {
      position: absolute;
      top: -12px;
      transform: translateY(-100%);
    }
  }
  .cta-btn {
    border-radius: 10px;
    font-family: "NH Text Regular";
    color: white;
    padding: 15px 40px;
    margin-top: 8px;
    white-space: nowrap;
    text-align: center;
    background: black;
    font-size: 12px;
    text-transform: uppercase;
    width: fit-content;
    border: 1px solid black;
    transition: all 0.2s;
  }
  .cta-btn:hover {
    background: white;
    color: black;
  }
  @media (min-width: 768px) {
    h1 {
      font-size: 40px;
    }
    h2 {
      font-size: 32px;
    }
  }
  .anim-underline-always {
		position: relative;
		width: fit-content;
		display: inline-block;
	}
	.anim-underline-always::after {
		content: '';
		position: absolute;
		bottom: 0px;
		left: 0;
		width: 100%;
		height: 1px;
		background-color: white;
		opacity: 1;
		transform: scale(1);
		transform-origin: center;
		transition: transform 200ms;
	}
	.anim-underline-always:hover::after,
	.anim-underline-always:focus::after {
	  animation: anim-underline 0.3s forwards;
  }

	@keyframes anim-underline {
		0% {
			transform: scaleX(0);
		}
		100% {
			transform: scaleX(1);
		}
	}
  
</style>
