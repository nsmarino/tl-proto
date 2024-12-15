<script>
  import { onMount } from 'svelte';
  import Scroller from "@sveltejs/svelte-scroller";
  import {products} from "$lib";

  
  let showSplash = false; // Toggle splash during development
  let preloadReady = false;
  let loadTracker = 0, imageLoadInfo, videoLoadInfo;
  let splashVideo, heroVideo;
  let videosReady = false

  $: preloadImageUrls = [
    ...[...Array(products.length).keys()].map(key => `/images/lifestyle-bg-${key+1}.png`),
    ...[...Array(products.length).keys()].map(key => `/images/product-bg-${key+1}.png`),
    ...[...Array(products.length).keys()].map(key => `/images/product-${key+1}.png`),
  ]

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
    imageLoadInfo.innerHTML = `Loading ${loadTracker} of ${preloadImageUrls.length} images...`
  }
  // Remove preload screen:
  $: if (loadTracker === (preloadImageUrls.length) && videosReady) {
      preloadReady = true;
      showSplash ? splashVideo?.play() : heroVideo?.play()
      if (!showSplash) document.querySelector(".hero").classList.add("entered")
  }

  let entranceManager;

  onMount(() => {
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
      threshold: [animThreshold, 0.9]
    });
  })

  // SCROLL PHASE
  // Scroller variables:
  let scrollContainer, index, offset, progress, animThreshold = 0.1, sectionsPerProduct=3, textEnterSpeed=60;

  function handleEntrance(entry){
    entry.target.classList.add("entered");
    // Side effects of entrances are handled via data attributes:
    // if (entry.target.dataset.lifestyleText) {
    //   Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
    //     setTimeout(() => {
    //       char.classList.add("entered")
    //     }, i*textEnterSpeed)
    //   })
      
    //   document.querySelector(`[data-product-bg="${entry.target.dataset.lifestyleText}"]`).classList.add("pre-entered")
    //   document.querySelector(`[data-product-image="${entry.target.dataset.lifestyleText-1}"]`)?.classList.remove("entered")
    // }
    if (entry.target.dataset.bgTrigger) {
      document.querySelector(`[data-product-bg="${entry.target.dataset.bgTrigger}"]`).classList.add("entered")
      document.querySelector(`[data-product-bg="${entry.target.dataset.bgTrigger-1}"]`)?.classList.remove("entered")
    }
  }
  function handleExit(entry){
    entry.target.classList.remove("entered");
    // Side effects of entrances are handled via data attributes:
    if (entry.target.dataset.lifestyleText) {
      document.querySelector(`[data-product-bg="${entry.target.dataset.lifestyleText}"]`).classList.remove("pre-entered")
      document.querySelector(`[data-product-image="${entry.target.dataset.lifestyleText-1}"]`)?.classList.add("entered")
    }
    if (entry.target.dataset.productImage) {
      document.querySelector(`[data-product-text="${entry.target.dataset.productImage}"]`).classList.remove("exited")
    }
  }
  function handleOnScreen(entry) {
    if(entry.target.dataset.lifestyleBg) {
      Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
        setTimeout(() => {
          char.classList.add("entered")
        }, i*textEnterSpeed)
      })
      document.querySelector(`[data-product-bg="${entry.target.dataset.lifestyleBg}"]`).classList.add("pre-entered")
      document.querySelector(`[data-product-image="${entry.target.dataset.lifestyleBg-1}"]`)?.classList.remove("entered")
    } else if (entry.target.dataset.bgTrigger) {
      Array.from(entry.target.querySelectorAll(".typewriter-char")).forEach((char, i) => {
        setTimeout(() => {
          char.classList.add("entered")
        }, i*textEnterSpeed)
      })
    } else if (entry.target.dataset.productImage) {
      document.querySelector(`[data-product-text="${entry.target.dataset.productImage}"]`).classList.add("exited")
    }
  }
  function attachEntrance(node){
    entranceManager.observe(node);
  }
  function calculateLifestyleBgScale(productIndex){
    // special case for the first lifestyle background bc it is the only one where a negative offset is possible:
    if (productIndex == 0) return offset < 0 ? 1-(offset/2) : 1
    return (index==productIndex*sectionsPerProduct-1) ? 1.5-(offset/2) : 1
  }
  function calculateProductBgScale(productIndex){
    return (index==productIndex*sectionsPerProduct) ? 1.5-(offset/2) : 1
  }
</script>

<svelte:head>
  {#each preloadImageUrls as image, i}
    <link rel="preload" as="image" href={image} onload={updateImageLoadProgress} />
  {/each}
</svelte:head>

<header class="fixed top-0 bg-[#FFF] w-full z-30">Touchland</header>

<!-- Splash video; removed after it plays -->
{#if showSplash}
  <div class="fixed inset-0 bg-[#0f0] z-40">
    <video class="w-full h-full object-cover" bind:this={splashVideo} muted autoplay playsinline preload="auto" onended={()=>{heroVideo.play(); splashVideo.parentElement.remove();document.documentElement.style.overflow="unset";if (showSplash) document.querySelector(".hero").classList.add("entered")}}>
        <source src="/videos/splash.mp4" type="video/mp4" />
    </video>
  </div>
{/if}

<div class="experience-container">
  <div class="hero w-full h-[100vh] md:h-[50vh] bg-[#fff] relative z-20">
      <video class="w-full h-1/2 md:h-full md:w-1/2 md:ml-[50%] object-cover" bind:this={heroVideo} loop muted autoplay playsinline preload="auto">
          <source src="/videos/placeholder.mp4" type="video/mp4" />
      </video>
      <div class="w-full h-[50vh] p-8 md:w-[50vw] md:h-screen md:fixed md:top-0 bg-[#fff] md:flex md:flex-col  md:justify-center md:gap-2">
        <div>New</div>
        <h1>Meet Body Mist.</h1>
        <p>Mood-boosting formulas for soothed skin and uplifted senses.</p>
        <button class="w-40 py-2 bg-black text-white uppercase text-xs">Join the waitlist</button>
        <button aria-label="Begin Scroll" class="absolute bottom-8 right-8 md:hidden" onclick={()=>{scrollContainer.scrollIntoView({behavior:"smooth",block:"start"})}}>
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
    <!-- <p class="fixed bottom-2 left-0 right-0 w-full text-center z-[999] bg-[#fff] text-[10px]">Index: {index}, Section Progress: {Math.round(offset*100)}%, Scene Progress: {Math.round(progress*100)}%</p> -->

    <!-- Product Backgrounds - fixed to viewport and managed via triggers inside Scroller -->
    {#each products as product, i}
      <img style="transform: scale({calculateProductBgScale(i)})" data-product-bg={i+1} src="/images/product-bg-{i+1}.png" class="w-full h-screen top-0 left-0 bottom-0 right-0 object-cover fixed md:w-[50vw] md:right-0 md:left-1/2" alt="">
    {/each}

    <Scroller top={animThreshold} bottom={animThreshold} threshold={animThreshold} bind:index bind:offset bind:progress>
      <div slot="background">
      </div>
      <div class="foreground-slot" slot="foreground" bind:this={scrollContainer}>
        {#each products as product, i}
          <!-- Lifestyle Background -->
          <section use:attachEntrance data-lifestyle-bg={i+1} class="sticky top-0 overflow-hidden" style="visibility:{index > ((i*sectionsPerProduct)) ? "hidden":"visible"};">
            <div class="image-mask w-full overflow-hidden relative" style="height: {index > ((i*sectionsPerProduct-1)) ? 100-(offset*100) : 100}%;)">
              <div class="absolute top-0 left-0 w-screen h-screen md:w-[50vw] z-20 flex items-center justify-center">
                <h1 class="font-serif uppercase text-[24px] text-[#FFF]">
                  {#each product.line1 as char}
                    <span class="typewriter-char">{char}</span>
                  {/each}
                </h1>
              </div>
              <img src="/images/lifestyle-bg-{i+1}.png" class="w-screen h-screen object-cover object-top" style="transform: scale({calculateLifestyleBgScale(i)})" alt="">
            </div>
          </section>

          <!-- Lifestyle Text -->
          <!-- <section use:attachEntrance data-lifestyle-text={i+1} class="sticky top-0 text-[#fff] overflow-hidden" style="visibility:{index > ((i*6)+2) ? "hidden":"visible"};">
            <div class="w-full" style="overflow: hidden; height: {index > ((i*6)+1) ? 100-(offset*100) : 100}%;">
              <div class="w-screen md:w-[50vw] h-screen flex items-center justify-center">
                <h1 class="font-serif uppercase text-[24px]">
                  {#each product.line1 as char}
                    <span class="typewriter-char">{char}</span>
                  {/each}
                </h1>
              </div>
            </div>
          </section> -->

          <!-- <section class="relative"></section> -->

          <!-- Product Background Placeholder, used to trigger a background image fixed to the window -->
          <!-- <section class="relative">
          </section> -->

          <!-- Product Text -->
          <section class="sticky top-0 flex items-center justify-center text-[#fff]" data-bg-trigger={i+1} use:attachEntrance>
            <h1 data-product-text={i+1} class="font-serif uppercase text-[24px]">
              {#each product.line2 as char}
                <span class="typewriter-char">{char}</span>
              {/each}
            </h1>
          </section>

          <!-- Product Image -->
            <section data-product-image={i+1} class="sticky top-0" use:attachEntrance>
              <img src="/images/product-{i+1}.png" alt="" class="h-full w-full object-contain">
            </section>
        {/each}
      </div>
    </Scroller>
    
    <div class="w-full h-[200vh] bg-[#0f0] relative z-40">Placeholder Footer</div>
  {:else}
      <div class="border border-black h-dvh w-full flex flex-col items-center justify-center fixed inset-0 bg-[#fff] z-[60]">
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
  @media (min-width: 768px) {
    .foreground-slot section {
      width: 50%;
      margin-left: 50%;
    }
  }

  :global([data-lifestyle-bg] .image-mask) {
    transform-origin: top center;
  }
  :global([data-lifestyle-bg].entered .image-mask) {
  }

  :global([data-product-text]) {
    opacity: 1;
    transition: opacity 0.8s ease-in-out;
  }
  :global([data-product-text].exited) {
    opacity: 0;
  }
  :global([data-product-image]) {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.6s ease-in-out;
  }
  :global([data-product-image].entered) {
    opacity: 1;
    transform: scale(1);
  }

  :global([data-product-bg]) {
    transform-origin: top center;
    visibility: hidden;
  }
  :global([data-product-bg].pre-entered) {
    visibility: visible;
  }
  :global([data-product-bg].entered) {
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
</style>