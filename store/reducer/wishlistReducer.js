import { createSlice } from "@reduxjs/toolkit"

/* "Save for later" list – persisted in localStorage together with the cart */
const initialState = { items: [] }

export const wishlistReducer = createSlice({
  name: "wishlistStore",
  initialState,
  reducers: {
    // payload: { productId, name, slug, image, mrp, sellingPrice, color? }
    toggleWishlist: (state, action) => {
      const p = action.payload
      const i = state.items.findIndex((x) => x.productId === p.productId)
      if (i >= 0) state.items.splice(i, 1)
      else state.items.unshift({ ...p, addedAt: Date.now() })
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((x) => x.productId !== action.payload)
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistReducer.actions
export default wishlistReducer.reducer
