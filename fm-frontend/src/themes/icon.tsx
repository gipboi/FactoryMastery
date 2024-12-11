import { createIcon } from '@chakra-ui/icons'

//* INFO: https://chakra-ui.com/docs/media-and-icons/icon#tips-for-generating-your-own-icons
//* INFO: using `path`
export const FilterIcon = createIcon({
  displayName: 'FilterIcon',
  viewBox: '0 0 200 200',
  // path can also be an array of elements, if you have multiple paths, lines, shapes, etc.
  path: <path fill="#2D3748" d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
})

export const UploaderIcon = createIcon({
  displayName: 'UploaderIcon',
  viewBox: '0 0 16 16',
  path: (
    <path
      fill="#2D3748"
      d="M8.666 3.885V12H7.333V3.885L3.757 7.461l-.943-.942L8 1.333l5.185 5.186-.943.942-3.576-3.576ZM7.143 13.333H14v1.334H2v-1.334h5.143Z"
    />
  )
})

//* INFO: OR using the `d` value of a path (the path definition) directly
// export const UpDownIcon = createIcon({
//   displayName: 'UpDownIcon',
//   viewBox: '0 0 200 200',
//   d: 'M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
// })
