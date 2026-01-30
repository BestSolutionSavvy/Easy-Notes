<template>
  <main
    class="flex-1 grid md:grid-cols-[1fr_auto_1fr] gap-0 overflow-hidden rounded-xl"
  >
    <div
      class="bg-white flex flex-col items-center justify-center md:rounded-l-xl"
    >
      <slot name="left"></slot>
    </div>

    <div class="hidden md:block relative w-20">
      <div class="absolute inset-0 flex">
        <div class="w-8.5 bg-white rounded-tr-xl rounded-br-xl"></div>
        <div class="w-8.5 bg-white rounded-tl-xl rounded-bl-xl ml-auto"></div>
      </div>

      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="flex flex-col items-center justify-between h-full w-16 py-20"
        >
          <img src="../assets/ring.svg" alt="decorative ring" />
          <img src="../assets/ring.svg" alt="decorative ring" />
          <img src="../assets/ring.svg" alt="decorative ring" />
          <img src="../assets/ring.svg" alt="decorative ring" />
          <img src="../assets/ring.svg" alt="decorative ring" />
        </div>
      </div>
    </div>

    <div
      class="bg-white flex flex-col items-center justify-between md:rounded-r-xl"
    >
      <slot name="right"></slot>
    </div>
  </main>
</template>
