import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { DEFAULT_API_KEY, fetchBrands, fetchOffers } from '../api/favoritApi'

const STORAGE_KEY = 'favorit:key'

const readStorage = (key, fallback = '') => {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // localStorage недоступен — настройки просто не сохранятся
    return
  }
}

export const searchBrands = createAsyncThunk(
  'search/brands',
  async (number, { getState, signal, rejectWithValue }) => {
    const { key } = getState().search
    try {
      return await fetchBrands({ key, number, signal })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(error.message || 'Не удалось выполнить поиск.')
    }
  },
)

export const searchOffers = createAsyncThunk(
  'search/offers',
  async ({ number, brand }, { getState, signal, rejectWithValue }) => {
    const { key } = getState().search
    try {
      return await fetchOffers({ key, number, brand, signal })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(error.message || 'Не удалось загрузить аналоги.')
    }
  },
)

const initialState = {
  key: readStorage(STORAGE_KEY) || DEFAULT_API_KEY,

  number: '',
  selectedBrand: null,
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setKey(state, action) {
      state.key = action.payload
      writeStorage(STORAGE_KEY, action.payload)
    },
    setNumber(state, action) {
      state.number = action.payload
    },

    selectBrand(state, action) {
      state.selectedBrand = action.payload
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null
    },
    resetSearch(state) {
      return { ...initialState, key: state.key }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state, action) => {
        state.number = action.meta.arg
        state.brands = []
        state.brandsStatus = 'loading'
        state.brandsError = null
        state.selectedBrand = null
        state.offers = []
        state.offersStatus = 'idle'
        state.offersError = null
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded'
        state.brands = action.payload
      })
      .addCase(searchBrands.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.brandsStatus = 'failed'
        state.brandsError = action.payload || 'Не удалось выполнить поиск.'
      })
      .addCase(searchOffers.pending, (state) => {
        state.offersStatus = 'loading'
        state.offersError = null
        state.offers = []
      })
      .addCase(searchOffers.fulfilled, (state, action) => {
        state.offersStatus = 'succeeded'
        state.offers = action.payload
      })
      .addCase(searchOffers.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.offersStatus = 'failed'
        state.offersError = action.payload || 'Не удалось загрузить аналоги.'
      })
  },
})

export const { setKey, setNumber, selectBrand, resetSearch } =
  searchSlice.actions
export default searchSlice.reducer
