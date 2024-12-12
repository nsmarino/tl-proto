<script>
  import { onMount } from 'svelte';
  import Scroller from "@sveltejs/svelte-scroller";

  // Toggle splash during development:
  let showSplash = true

  let index, offset, progress;

  let entranceManager;

  let preloadReady = false;
  const bgImageCount = 4;
  const fgImageCount = 2

  // This will generate an array of urls such as /images/1.png, /images/2.png, up to numberOfImages
  $: preloadBackgroundUrls = [...Array(bgImageCount).keys()].map((key) => `/images/tl-scroll-bg-${key+1}.png`);
  $: preloadForegroundUrls = [...Array(fgImageCount).keys()].map((key) => `/images/tl-scroll-fg-${key+1}.png`);
  let loadTracker = 0, imageLoadInfo, videoLoadInfo;

  let scrollContainer;
  let splashVideo, heroVideo;
  let videosReady = false

  // PRELOAD PHASE
  let videoLoadChecker = setInterval(()=>{
    if (showSplash) {
      if (splashVideo?.readyState > 3 && heroVideo?.readyState > 3) {
          videosReady = true;
          clearInterval(videoLoadChecker);
          videoLoadInfo.innerHTML = "Videos Ready!"
      }    
    } else {
      if (heroVideo?.readyState > 3) {
          videosReady = true;
          clearInterval(videoLoadChecker);
          document.documentElement.style.overflow="unset"
      }
    }
  }, 200)

  function updateImageLoadProgress(){
    loadTracker ++
    imageLoadInfo.innerHTML = `Loading ${loadTracker} of ${bgImageCount + fgImageCount} images...`
  }

  // Remove preload screen:
  $: if (loadTracker === (bgImageCount + fgImageCount) && videosReady) {
      preloadReady = true;
      showSplash ? splashVideo?.play() : heroVideo?.play() 
  }

  onMount(() => {
    entranceManager = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("entered");
          if (entry.target.classList.contains("product-image-1")) {
            document.querySelector(".product-text-1").classList.add("exited")
          }
          if (entry.target.classList.contains("product-image-2")) {
            document.querySelector(".product-text-2").classList.add("exited")
          }
          if (entry.target.classList.contains("product-bg-1-trigger")) {
            document.querySelector(".product-bg-1").classList.add("entered")
          }
          if (entry.target.classList.contains("product-bg-2-trigger")) {
            document.querySelector(".product-bg-2").classList.add("entered")
          }
        } else {
          // entry.target.classList.remove("entered");
          if (entry.target.classList.contains("product-image-2")) {
            document.querySelector(".product-text-2").classList.remove("exited")
          }
        }
      });
    }, {
      threshold: [0.2]
    });
  })
  // SCROLL PHASE
  function attachEntrance(node){
    console.log("Attaching node to entranceManager", node)
    entranceManager.observe(node);
  }

</script>

<svelte:head>
  {#each preloadBackgroundUrls as image, i}
    <link rel="preload" as="image" href={image} onload={updateImageLoadProgress} />
  {/each}
  {#each preloadForegroundUrls as image, i}
    <link rel="preload" as="image" href={image} onload={updateImageLoadProgress} />
  {/each}
</svelte:head>

<header class="fixed top-0 bg-[#FFF] w-full z-30">Touchland</header>

<!-- Splash video; removed after it plays -->
{#if showSplash}
  <div class="fixed inset-0 bg-[#0f0] z-20">
    <video class="w-full h-full object-cover" bind:this={splashVideo} muted autoplay playsinline preload="auto" onended={()=>{heroVideo.play(); splashVideo.parentElement.remove();document.documentElement.style.overflow="unset"}}>
        <source src="/videos/splash.mp4" type="video/mp4" />
    </video> 
  </div>
{/if}

<div class="container">
  <div class="hero snap w-full h-[100vh] bg-[#fff] relative z-20">
      <video class="w-full h-1/2 object-cover" bind:this={heroVideo} loop muted autoplay playsinline preload="auto">
          <source src="/videos/placeholder.mp4" type="video/mp4" />
      </video>
      <div class="w-full h-[50vh] p-8">
        <div>New</div>
        <h1>Meet Body Mist.</h1>
        <p>Mood-boosting formulas for soothed skin and uplifted senses.</p>
        <button>Join the waitlist</button>
        <button aria-label="Begin Scroll" class="absolute bottom-8 right-8" onclick={()=>{scrollContainer.scrollIntoView({behavior:"smooth",block:"start"})}}>
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

  {#if preloadReady}
  <p class="fixed bottom-2 left-0 right-0 w-full text-center z-[999] bg-[#fff] text-[10px]">Section {index + 1}, Section Progress: {Math.round(offset*100)}%, Scene Progress: {Math.round(progress*100)}%</p>
  <img src="/images/tl-scroll-bg-2.png" class="product-bg-1 w-full h-screen object-cover fixed inset-0" alt="">
  <img src="/images/tl-scroll-bg-4.png" class="product-bg-2 w-full h-screen object-cover fixed inset-0" style="visibility: {index + 1 > 6 ? "visible" : "hidden"}" alt="">

  <Scroller top={0.1} bottom={0.1} threshold={0.1} bind:index bind:offset bind:progress>
    <div slot="background">
    </div>
  
    <div class="foreground-slot" slot="foreground" bind:this={scrollContainer}>

      <!-- PRODUCT 1: -->
        <!-- Lifestyle Background -->
        <section use:attachEntrance class="lifestyle-bg sticky top-0 overflow-hidden" style="visibility: {index+1 > 3 ? "hidden": "auto"}">
          <div class="image-mask w-full overflow-hidden" style="height: {index+1 > 2 ? 100-(offset*100) : 100}%;">
            <img src="/images/tl-scroll-bg-1.png" class="w-screen h-screen object-cover object-top" alt="">
          </div>
        </section>

        <!-- Lifestyle Text -->
        <section class="sticky top-0 text-[#fff] overflow-hidden" style="visibility: {index+1 > 3 ? "hidden": "auto"}">
          <div class="w-full" style="overflow: hidden; height: {index+1 > 2 ? 100-(offset*100) : 100}%;">
            <div class="w-screen h-screen flex items-center justify-center">
              <h1 class="font-serif uppercase text-[24px]">I want to</h1>
            </div>
          </div>
        </section>

        <section class="relative"></section>

        <!-- Product Background -->
        <section class="relative product-bg-1-trigger" use:attachEntrance>
        </section>

        <!-- Product Text -->
        <section class="sticky top-0 flex items-center justify-center text-[#fff]">
          <h1 class="product-text-1 font-serif uppercase text-[24px]">Feel Transported</h1>
        </section>

        <!-- Product Image -->
          <section class="product-image-1 sticky top-0" use:attachEntrance style="visibility: {index+1 > 6 ? "hidden": "auto"}">
            <img src="/images/tl-scroll-fg-1.png" alt="" class="h-full w-full object-contain">
          </section>

      <!-- PRODUCT 2: -->
       <!-- Lifestyle Background -->
       <section use:attachEntrance class="lifestyle-bg sticky top-0 overflow-hidden" style="visibility: {index+1 > 9 ? "hidden": "auto"}">
        <div class="image-mask w-full overflow-hidden" style="height: {index+1 > 8 ? 100-(offset*100) : 100}%;">
          <img src="/images/tl-scroll-bg-3.png" class="w-screen h-screen object-cover object-top" alt="">
        </div>
      </section>

      <!-- Lifestyle Text -->
      <section class="sticky top-0 text-[#fff] overflow-hidden" style="visibility: {index+1 > 9 ? "hidden": "auto"}">
        <div class="w-full" style="border: 2px solid green; overflow: hidden; height: {index+1 > 8 ? 100-(offset*100) : 100}%;">
          <div class="w-screen h-screen flex items-center justify-center">
            <h1 class="font-serif uppercase text-[24px]">I want to</h1>
          </div>
        </div>
      </section>

      <section class="relative"></section>

      <!-- Product Background -->
      <section class="relative product-bg-2-trigger" use:attachEntrance>
      </section>

      <!-- Product Text -->
      <section class="sticky top-0 flex items-center justify-center text-[#fff]">
        <h1 class="product-text-2 font-serif uppercase text-[24px]">Break From Boredom</h1>
      </section>

      <!-- Product Image -->
        <section class="product-image-2 sticky top-0" use:attachEntrance style="visibility: {index+1 > 12 ? "hidden": "auto"}">
          <img src="/images/tl-scroll-fg-2.png" alt="" class="h-full w-full object-contain">
        </section>
        
    </div>
  </Scroller>
  <div class="w-full h-[200vh] bg-[#0f0] relative z-40">Placeholder Footer</div>
  {:else}
      <div class="border border-black h-dvh w-full flex flex-col items-center justify-center fixed inset-0 bg-[#fff] z-30">
        <div>Preloading...</div>
        <p bind:this={videoLoadInfo}></p>
        <p bind:this={imageLoadInfo}></p>
      </div>
  {/if}
</div>

<style global>
  :root {
    overflow: hidden;
  }

  .foreground-slot section {
    height: 100vh;
  }

  :global(.lifestyle-bg .image-mask) {
    transform: scale(1.4);
    transform-origin: top center;
    transition: transform 0.6s ease-in-out;
  }
  :global(.lifestyle-bg.entered .image-mask) {
    transform: scale(1);
  }

  :global(.product-text-1) {
    opacity: 1;
    transition: opacity 0.8s ease-in-out;
  }
  :global(.product-text-1.exited) {
    opacity: 0;
  }
  :global(.product-image-1) {
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  :global(.product-image-1.entered) {
    opacity: 1;
  }
  :global(.product-text-2) {
    opacity: 1;
    transition: opacity 0.8s ease-in-out;
  }
  :global(.product-text-2.exited) {
    opacity: 0;
  }
  :global(.product-image-2) {
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  :global(.product-image-2.entered) {
    opacity: 1;
  }

  :global(.product-bg-1, .product-bg-2) {
    transform: scale(1.4);
    transform-origin: top center;
    transition: transform 0.8s ease-in-out;
  }
  :global(.product-bg-1.entered, .product-bg-2.entered) {
    transform: scale(1);
  }
</style>