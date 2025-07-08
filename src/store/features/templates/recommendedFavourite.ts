import {createSlice, PayloadAction} from "@reduxjs/toolkit";

type RecommendedFavouritesState = string[]; // Template-IDs

const initialState: RecommendedFavouritesState = [];

const recommendedFavourites = createSlice({
  name: "recommendedFavourites",
  initialState,
  reducers: {
    toggleRecommendedFavourite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.includes(id)) {
        return state.filter((favId) => favId !== id);
      } 
        return [...state, id];
      
    },
  },
});

export const {toggleRecommendedFavourite} = recommendedFavourites.actions;
export default recommendedFavourites.reducer;
