<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border text-center text-[3rem] text-darkslategray font-inter"
  >
    <div
      class="w-full flex-1 overflow-hidden flex flex-col items-center justify-center gap-[0.312rem] max-w-full"
    >
      <div class="relative font-semibold">
        Ups!<br />This page<br />does not exist :(
      </div>
      <div class="flex items-start text-left text-[2rem]">
        <RouterLink
          to="/"
          class="relative text-blue-500 underline leading-[140%]"
        >
          Home Page
        </RouterLink>
      </div>
    </div>
  </div>
</template>
