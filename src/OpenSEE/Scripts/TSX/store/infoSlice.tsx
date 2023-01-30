import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  eventInfo: {
    MeterName: "",
    StationName: "",
    AssetName: "",
    EventName: "",
    EventDate: "",
  }
}

const eventInfoSlice = createSlice({
  name: "eventInfo",
  initialState,
  reducers: {
    setEventInfoData: (state, action) => {
      state.eventInfo = action.payload
    }
  }
})

export const { setEventInfoData } = eventInfoSlice.actions
export default eventInfoSlice.reducer