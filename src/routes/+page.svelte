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
        console.log(entry)
        if (entry.isIntersecting) {
          console.log("Entered!")
          entry.target.classList.add("entered");
        } else {
            // entry.target.classList.remove("entered");
        }
      });
    }, {
      threshold: [0.05]
    });
  })
  // SCROLL PHASE
  function attachEntrance(node){
    console.log("Attaching node to entranceManager")
    entranceManager.observe(node);
  }

  function calculateBackgroundOffset(startingSection){
    console.log("Calculating...")
    return index + 1 > startingSection ? 0 : (100 - (offset*100))*-1
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

<header class="fixed top-0 bg-[#FFF] w-full z-20">Touchland</header>

<!-- Splash video; removed after it plays -->
{#if showSplash}
  <div class="fixed inset-0 bg-[#0f0] z-20">
    <video class="w-full h-full object-cover" bind:this={splashVideo} muted autoplay playsinline preload="auto" onended={()=>{heroVideo.play(); splashVideo.parentElement.remove();document.documentElement.style.overflow="unset"}}>
        <source src="/videos/splash.mp4" type="video/mp4" />
    </video> 
  </div>
{/if}

<div class="container">
  <div class="hero snap w-full h-[100vh] bg-[#fff]">
      <video class="w-full h-1/2 object-cover" bind:this={heroVideo} loop muted autoplay playsinline preload="auto">
          <source src="/videos/placeholder.mp4" type="video/mp4" />
      </video>
      <div class="w-full h-[50vh] p-8">
        <div>New</div>
        <h1>Meet Body Mist.</h1>
        <p>Mood-boosting formulas for soothed skin and uplifted senses.</p>
        <button>Join the waitlist</button>
        <button aria-label="Begin Scroll" class="absolute bottom-8 right-8">
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

  <Scroller top={0.1} bottom={0.1} threshold={0.1} bind:index bind:offset bind:progress>
    <div slot="background"></div>
  
    <div class="foreground-slot" slot="foreground">
      <!-- PRODUCT 1: -->
        <!-- Lifestyle Background -->
        <section class="sticky top-0">
          <img src="/images/tl-scroll-bg-1.png" class="w-full h-full object-cover" alt="">
        </section>

        <!-- Lifestyle Text -->
        <section class="relative flex items-center justify-center text-[#fff]">
          <h1 class="font-serif uppercase text-[24px]">I want to</h1>
        </section>

        <!-- Product Background -->
        <section class="sticky top-0 overflow-hidden">
          <img src="/images/tl-scroll-bg-2.png" class="w-full h-full object-cover" alt="" style="transform: translate3d(0, {calculateBackgroundOffset(2)}%, 0)">
        </section>

        <!-- Product Text -->
        <section class="sticky top-0 flex items-center justify-center text-[#fff]">
          <h1 class="font-serif uppercase text-[24px]">Feel Transported</h1>
        </section>

        <!-- Product Image -->
          <section class="relative">
            <img src="/images/tl-scroll-fg-1.png" alt="" class="h-full w-full object-contain">
          </section>

      <!-- PRODUCT 2: -->
        <!-- Lifestyle Background -->
        <section class="sticky top-0">
          <img src="/images/tl-scroll-bg-3.png" class="w-full h-full object-cover" alt="">
        </section>

        <!-- Lifestyle Text -->
        <section class="relative flex items-center justify-center text-[#fff]">
          <h1 class="font-serif uppercase text-[24px]">I want to</h1>
        </section>

        <!-- Product Background -->
        <section class="sticky top-0 overflow-hidden">
          <img src="/images/tl-scroll-bg-4.png" class="w-full h-full object-cover" alt="" style="transform: translate3d(0, {index + 1 > 7 ? 0 : (100 - (offset*100))*-1}%, 0)">
        </section>

        <!-- Product Text -->
        <section class="sticky top-0 flex items-center justify-center text-[#fff]">
          <h1 class="font-serif uppercase text-[24px]">Break From Boredom.</h1>
        </section>

        <!-- Product Image -->
          <section class="relative">
            <img src="/images/tl-scroll-fg-2.png" alt="" class="h-full w-full object-contain">
          </section>
    </div>
  </Scroller>
  <div class="w-full h-[200vh] bg-[#0f0]">Placeholder Footer</div>
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
    border: 2px solid red;
  }

  
  :global(.lifestyle-container) {
    position: sticky;
    top: 0;
    overflow: scroll;
    height: 100vh;
    transform: scale(1.5);
    transform-origin: top center;
    transition: transform .6s;
  }
  :global(.lifestyle-container.entered) {
    transform: scale(1);
    transform-origin: top center;
  }
  /* .scroll-card-lifestyle {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-color: pink;
  } */
  .scroll-card-spacer {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    
    position: relative;
  }
  :global(.scroll-card-text) {
    position: sticky;
    top: 0%;
    height: 100vh;
    width: 100%;
    opacity: 0;
    transition: 0.4s;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 60px;
  }
  :global(.scroll-card-text.entered) {
    opacity: 1;
  }
  .scroll-card-product {
    width: 100%;
    height: 100vh;
    border: 2px solid red;
    position: relative;
    backdrop-filter: opacity(0);
    overflow: hidden;
  }

  :global(.product-bg) {
    transition: transform 0.8s;
    transform:  scale(1.5);
    transform-origin: top center;

  }

  :global(.product-bg.entered) {
    transform: translateY(0%) scale(1);
  }

</style>