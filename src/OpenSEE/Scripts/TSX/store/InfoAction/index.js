import { setEventInfoData } from "../infoSlice"

export const eventInfoAction = (dispatch, url) => {
    $.ajax({
        type: "GET",
        url,
        dataType: 'json',
        cache: true,
        async: true
    })
    .then(data => 
        {
            console.log(data)
            dispatch(setEventInfoData(data))
        }
    )
    .catch(err => console.log(err))
}