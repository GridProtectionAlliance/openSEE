import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { OpenSee } from '../global';
declare var homePath: string;

export const SetEventInfo = createAsyncThunk("eventInfo/setEventInfo", async (arg: { breakeroperation: string }, thunkAPI) => {
    const eventID = ((thunkAPI.getState() as any).EventInfo as OpenSee.IEventStore).EventID;
    const data = await $.ajax({
      type: "GET",
        url: `${homePath}api/OpenSEE/GetHeaderData?eventId=${eventID}${arg.breakeroperation != undefined ? "&breakeroperation=" + arg.breakeroperation : ""}`,
      dataType: 'json',
      cache: true,
      async: true
    })
  return data
})

const eventInfoSlice = createSlice({
  name: "eventInfo",
  initialState: {
    EventInfo: {
      MeterName: "",
      StationName: "",
      AssetName: "",
      EventName: "",
      EventDate: "",
      },
      State: 'Idle',
      EventID: 0,
      Navigation: 'system' 
  } as OpenSee.IEventStore,
  reducers: {

  },
  extraReducers: (builder) => {
      builder.addCase(SetEventInfo.pending, (state, action) => {
          state.State = 'Loading'
    });
    
    builder.addCase(SetEventInfo.rejected, (state, action) => {
          state.State = 'Error'
    });

    builder.addCase(SetEventInfo.fulfilled, (state, action) => {
      state.EventInfo = action.payload
      state.State = 'Idle'
    })
  }
})


export const SelectEventInfo = (state) => state?.EventInfo?.eventInfo

export default eventInfoSlice.reducer