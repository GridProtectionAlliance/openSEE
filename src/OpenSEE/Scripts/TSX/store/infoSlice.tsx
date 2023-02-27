import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { OpenSee } from '../global';
declare var homePath: string;

export const selectEventInfo = (state) => state?.EventInfo?.eventInfo

export const setEventInfo = createAsyncThunk("eventInfo/setEventInfo", async (urlData: { eventID: number, breakeroperation: string }, thunkAPI) => {
  const data = await $.ajax({
      type: "GET",
      url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${urlData.eventID}${urlData.breakeroperation != undefined ? "&breakeroperation=" + urlData.breakeroperation : ""}`,
      dataType: 'json',
      cache: true,
      async: true
    })
  return data
})


const eventInfoSlice = createSlice({
  name: "eventInfo",
  initialState: {
    eventInfo: {
      MeterName: "",
      StationName: "",
      AssetName: "",
      EventName: "",
      EventDate: "",
    },
    error: false ,
    loading: false 
  } as OpenSee.iEventInfoStore,
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(setEventInfo.pending, (state, action) => {
      state.loading = true
    });
    
    builder.addCase(setEventInfo.rejected, (state, action) => {
      state.loading = false
      state.error = true
    });

    builder.addCase(setEventInfo.fulfilled, (state, action) => {
      state.eventInfo = action.payload
      state.loading = false
      state.error = false
    })
  }
})

export default eventInfoSlice.reducer