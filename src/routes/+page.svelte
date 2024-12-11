<script>
    let preloadReady = false;
    const numberOfImages = 6;
  
    // This will generate an array of urls such as /images/1.png, /images/2.png, up to numberOfImages
    $: preloadImageUrls = [...Array(numberOfImages).keys()].map((key) => `/images/${key+1}.png`);
    let loadTracker = 0

    let splashVideo, heroVideo;
    let videosReady = false

    let videoLoadChecker = setInterval(()=>{
        if (splashVideo?.readyState > 3 && heroVideo?.readyState > 3) {
            console.log("Interval says they are ready.");
            videosReady = true;
            clearInterval(videoLoadChecker);
        }
    }, 100)

    $: if (loadTracker === numberOfImages && videosReady) {
        console.log("ALL IMAGES AND VIDEOS PRELOADED :)")
        preloadReady = true;
    }
  </script>

  <svelte:head>
    {#each preloadImageUrls as image, i}
      <link rel="preload" as="image" href={image} onload={()=>loadTracker++} />
    {/each}
  </svelte:head>

    <video bind:this={splashVideo} loop muted playsinline preload="auto">
        <source src="/videos/splash.mp4" type="video/mp4" />
    </video>
    <header>Touchland</header>
    <div>
        <video bind:this={heroVideo} loop muted playsinline preload="auto">
            <source src="/videos/placeholder.mp4" type="video/mp4" />
        </video>        
    </div>

  {#if preloadReady}
    <div>Preloaded!</div>
    <div>
        <img src="/images/1.png" alt="test" />
    </div>
  {:else}
    <div class="border border-black h-dvh w-full flex items-center justify-center fixed inset-0 bg-[#00f]">Preloading...</div>
  {/if}
