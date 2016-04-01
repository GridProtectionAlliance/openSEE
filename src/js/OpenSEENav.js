 //******************************************************************************************************
//  OpenNav.js - Gbtc
//
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/06/2016 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************

//////////////////////////////////////////////////////////////////////////////////////////////
// Global

    var javascriptversion = "13";

    var usersettings = {
        lastSetting: {},
        uisettings: []
    };

    var applicationsettings = {};

    var loadingPanel = null;

    var datafromdate = new Date();
    var datatodate = new Date();

    var postedUserName = "";

//////////////////////////////////////////////////////////////////////////////////////////////

    function RemoveFromArray(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        return arr.push.apply(arr, rest);
    };

//////////////////////////////////////////////////////////////////////////////////////////////

    function loadDataForDateClick() {
        $("#staticPeriod")[0].value = "Custom";
        loadDataForDate();
    }

//////////////////////////////////////////////////////////////////////////////////////////////

    function loadDataForDate() {

        contextfromdate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerFrom').datepicker('getDate')));
        contexttodate = new Date($.datepicker.formatDate("mm/dd/yy", $('#datePickerTo').datepicker('getDate')));
            
        var thesiteids = GetCurrentlySelectedSitesIDs();
        var thesitename = "All";

        var from = getFormattedDate(contextfromdate);
        var to = getFormattedDate(contexttodate);

        populateEventsDivWithGrid('getDetailsForSitesEventsDateRange', 'DetailEvents', thesitename, thesiteids, from , to);
    }

//////////////////////////////////////////////////////////////////////////////////////////////

function GetAllSitesIDs() {

    var returnValue = "";

    $.each(cache_Map_Matrix_Data.d, function (key, value) {
        returnValue += value.id + ",";
    });

    return (returnValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function GetCurrentlySelectedSites() {
    return ($('#siteList').multiselect("getChecked").map(function() {
        return this.title + "|" + this.value;
    }).get());
}

//////////////////////////////////////////////////////////////////////////////////////////////

function GetCurrentlySelectedSitesIDs() {

    var thearray = $('#siteList').multiselect("getChecked").map(function () {
        return this.value + ",";
    }).get();

    var returnValue = "";

    $.each(thearray, function (key, value) {
        returnValue += value;
    });

    return (returnValue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function populateEventsDivWithGrid(thedatasource, thediv, siteName, siteID, theDateFrom, theDateTo) {

    var thedatasent = "{'siteID':'" + siteID + "', 'targetDateFrom':'" + theDateFrom + "', 'targetDateTo':'" + theDateTo + "','userName':'" + postedUserName + "'   }";

    $('#DetailEvents').puidatatable({
        paginator: {
            rows: 20
        },
        selectionMode: 'single',
        columns: [
            { field: 'starttime', headerText: 'Start Time', headerStyle: "width: 220px", bodyStyle: "width: 220px", filter: true, sortable: true },
            { field: 'endtime', headerText: 'End Time', headerStyle: "width: 220px", bodyStyle: "width: 220px", filter: true, sortable: true },
            { field: 'thesite', headerText: 'Name', filter: true, sortable: true },
            { field: 'thename', headerText: 'Event Type', filter: true, sortable: true },
            { field: 'OpenSEE', headerText: ' ', content: makeOpenSEEButton_html, headerStyle: "width: 40px", bodyStyle: "width: 40px; padding: 0; cellsalign: 'left'" }
        ],
        datasource: function(callback) {
            $.ajax({
                type: "POST",
                url: './eventService.asmx/' + thedatasource,
                data: thedatasent,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                context: this,
                success: function(data) {
                    callback.call(this, JSON.parse(data.d));
                }
            });
        }
    });

   
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeOpenSEEButton_html(rowdata) {
    var return_html = "";
    return_html += '<div style="cursor: pointer; width: 100%; Height: 100%; text-align: center; margin: auto; border: 0 none;">';
    return_html += '<button onClick="OpenWindowToOpenSEE(' + rowdata.eventid + ');" value="" style="cursor: pointer; text-align: center; margin: auto; border: 0 none;" title="Launch OpenSEE Waveform Viewer">';
    return_html += '<img class="dgButtonIcon" src="images/openSEE.png" /></button></div>';
    return (return_html);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function OpenWindowToOpenSEE(id) {
    var popup = window.open("openSEE.aspx?eventid=" + id, id + "openSee", "left=0,top=0,width=1024,height=768,status=no,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no");
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
}

//////////////////////////////////////////////////////////////////////////////////////////////

function SelectAdd(theControlID,theValue,theText,selected) {

    var exists = false;

    $('#' + theControlID + ' option').each(function () {
        if (this.innerHTML == theText) {
            exists = true;
            return false;
        }
    });

    if (!exists) {
        $('#' + theControlID).append("<option value='" + theValue + "' " + selected+ ">" + theText + "</option>");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function highlightDaysInCalendar(date) {
    var i = -1;

        switch ( currentTab ) {
        
            case "Events":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesEvents)) > -1) {
                    return [true, 'highlight', calendartipsEvents[i]];
                }

                break;

            case "Faults":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesEvents)) > -1) {
                    if (calendartipsEvents[i].indexOf("Fault") > -1) {
                        return [true, 'highlight', calendartipsEvents[i]];
                    }
                }
                break;

            case "Trending":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesTrending)) > -1) {
                    return [true, 'highlight', calendartipsTrending[i]];
                }
                break;

            case "Breakers":
                if ((i = $.inArray(date.toString().substr(0, 16), calendardatesBreakers)) > -1) {
                    return [true, 'highlight', calendartipsBreakers[i]];
                }
                break;
        }
    
    return [true, ''];
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializeDatePickers(datafromdate , datatodate) {

    $("#datePickerFrom").datepicker({
        onSelect: function (dateText, inst) {
            //$("#staticPeriod")[0].value = "Custom";
        },
        onChangeMonthYear: function (year, month, instance) {

            var d = instance.selectedDay;
            // Set new Date(year, month, 0) for entire month
            $(this).datepicker('setDate', new Date(year, month - 1, d));
        },

        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        autoSize: false,
        //beforeShowDay: highlightDaysInCalendar,
        timeFormat: 'hh:mm:ss',
        dateFormat: 'mm/dd/yy',
        showButtonPanel: false,

        onClose: function (selectedDate) {
            $("#datePickerTo").datepicker("option", "minDate", selectedDate);
        }
    });

    $("#datePickerFrom").datepicker("setDate", new Date(datafromdate));

    $("#datePickerTo").datepicker({
        onSelect: function (dateText, inst) {
        },
        onChangeMonthYear: function (year, month, instance) {

            var d = instance.selectedDay;
            // Set new Date(year, month, 0) for entire month

            $(this).datepicker('setDate', new Date(year, month - 1, d));
        },

        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        autoSize: true,
        //beforeShowDay: highlightDaysInCalendar,
        timeFormat: 'hh:mm:ss',
        dateFormat: 'mm/dd/yy',
        showButtonPanel: false,
        onClose: function (selectedDate) {
            $("#datePickerFrom").datepicker("option", "maxDate", selectedDate);
        }
    });

    $("#datePickerTo").datepicker("setDate", new Date(datatodate));
}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadconfigdropdown(currentselected) {
    $('#Configurations')[0].options.length = 0;
    $.each(usersettings.uisettings, function (key, value) {
        SelectAdd("Configurations", key, value.Name, (currentselected == value.Name) ? "selected" : "");
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function validatesettings(usersettings) {

    if (typeof (usersettings["lastSetting"]) == 'undefined') {
        initializesettings();
        return (false);
    };

    if (typeof (usersettings["javascriptversion"]) == 'undefined') {
        initializesettings();
        return (false);
    } else if (usersettings["javascriptversion"] != javascriptversion) {
        initializesettings();
        return (false);
    }

    $.each(usersettings.uisettings, function(key, value) {

        if (typeof (value["Name"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["CurrentTab"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["DataFromDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["DataToDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };

        if (typeof (value["ContextFromDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["ContextToDate"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["MapGrid"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["EventSiteDropdownSelected"]) == 'undefined') {
            initializesettings();
            return (false);
        };
        if (typeof (value["staticPeriod"]) == 'undefined') {
            initializesettings();
            return (false);
        };
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationapply(item) {
        
    var currentconfigname = $("#Configurations :selected").text();

    usersettings["lastSetting"] = currentconfigname;

    $.jStorage.set("usersettings", usersettings);

    $("#datePickerFrom").datepicker("setDate", new Date(getcurrentconfigsetting("DataFromDate")));

    $("#datePickerTo").datepicker("setDate", new Date(getcurrentconfigsetting("DataToDate")));

    contextfromdate = getcurrentconfigsetting("ContextFromDate");
    contexttodate = getcurrentconfigsetting("ContextToDate");

    var selectedsites = getcurrentconfigsetting("EventSiteDropdownSelected");
    if (selectedsites != null) {
        $('#siteList').multiselect("uncheckAll");
        $('#siteList').val(selectedsites);
    }
    else {
        $('#siteList').multiselect("checkAll");
    }

    $('#siteList').multiselect('refresh');

    $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

    loadDataForDate();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function deleteconfirmation(item) {

    var currentconfigname = $("#Configurations :selected").text();

    if (currentconfigname == "Last Session") return;
    if (currentconfigname == "Default") return;

    $('#deleteconfigname')[0].innerText = currentconfigname;

    var dialog = $('#delete-dialog').dialog({
        modal: true,
        stack: true,
        width: 300,
        buttons: {

            "Delete": function () {

                var loc = -1;

                $.each(usersettings.uisettings, function (key, value) {
                    if (currentconfigname == value.Name) {


                            RemoveFromArray(usersettings.uisettings, key, key);
                            usersettings["lastSetting"] = "Default";
                            $.jStorage.set("usersettings", usersettings);
                            loadconfigdropdown("Default");
                            configurationapply(item);
                            return (false);
                            
                    }
                });

                $(this).dialog("close");
            },

            Cancel: function () {

                $(this).dialog("close");

            }

        }
    }).parent('.ui-dialog').css('zIndex', 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationscopy(item) {
    var dialog = $('#modal-dialog').dialog({
        modal: true,
        stack: true,
        width: 300,
        buttons: {

            "Create": function () {
                var theconfigname = $("#newconfigname").val();
                $("#newconfigname")[0].value = "";

                if (theconfigname.length > 0) {
                    createupdateconfig(theconfigname);
                    loadconfigdropdown(theconfigname);
                }

                $(this).dialog("close");
            },

            Cancel: function () {

                $(this).dialog("close");

            }

        }
    }).parent('.ui-dialog').css('zIndex', 1000000);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function substituteToken(thetoken) {

var returnvalue = "";

switch (thetoken) {

    case "Today":
        returnvalue = $.datepicker.formatDate("mm/dd/yy", new Date());
        break;

    case "PastWeek":
        var d = new Date();
        d.setDate(d.getDate() - 7);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;

    case "PastMonth":

        var d = new Date();
        d.setDate(d.getDate() - 30);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;

    case "PastYear":
        var d = new Date();
        d.setDate(d.getDate() - 365);

        returnvalue = $.datepicker.formatDate("mm/dd/yy", d);
        break;
            
    default:
        returnvalue = thetoken;
        /// Today
        break;
}

return (returnvalue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getcurrentconfigsetting(configatom) {
    var returnvalue = null;
    var currentconfigname = $("#Configurations :selected").text();

    $.each(usersettings.uisettings, function (key, value) {
        if (currentconfigname == value.Name) {

            switch (configatom) {
                
                case "DataToDate":
                case "DataFromDate":
                case "ContextToDate":
                case "ContextFromDate":
                    returnvalue = substituteToken(value[configatom]);
                    break;

                default:
                    returnvalue = value[configatom];
                    break;
            }

            return (false);
        }
    });
    return (returnvalue);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationsupdate(item) {
    var currentconfigname = $("#Configurations :selected").text();
    createupdateconfig(currentconfigname);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function configurationsdelete(item) {
    deleteconfirmation(item);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function initializesettings() {
    var thesetting = {};
    usersettings.uisettings.length = 0;

    usersettings["javascriptversion"] = javascriptversion;

    thesetting["Name"] = "Default";
    thesetting["DataToDate"] = "Today";
    thesetting["DataFromDate"] = "PastMonth";
    thesetting["ContextToDate"] = "Today";
    thesetting["ContextFromDate"] = "PastMonth";
    thesetting["CurrentTab"] = "0";
    thesetting["MapGrid"] = "Grid";
    thesetting["EventSiteDropdownSelected"] = null;
    thesetting["staticPeriod"] = "PastMonth";

    usersettings["uisettings"].push(thesetting);

    var thesetting = {};
    thesetting["Name"] = "Last Session";
    thesetting["CurrentTab"] = "0";
    thesetting["DataFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datafromdate));
    thesetting["DataToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datatodate));
    thesetting["ContextFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datafromdate));
    thesetting["ContextToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(datatodate));
    thesetting["MapGrid"] = "Map";
    thesetting["EventSiteDropdownSelected"] = null;
    thesetting["staticPeriod"] = "Custom";

    usersettings["lastSetting"] = "Default";
    usersettings["uisettings"].push(thesetting);

    $.jStorage.set("usersettings", null);
    $.jStorage.set("usersettings", usersettings);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function createupdateconfig(configname) {

    if (configname == "Default") return;

    if (configname == null) {
        configname = "Last Session";
    }

    if (usersettings == null) {
        usersettings = {
            lastSetting: {},
            uisettings: []
        };
    }

    var thesetting = {};

    thesetting["Name"] = configname;
    thesetting["CurrentTab"] = "Events";
    thesetting["DataFromDate"] = $("#datePickerFrom")[0].value;
    thesetting["DataToDate"] = $("#datePickerTo")[0].value;
    thesetting["ContextFromDate"] = $.datepicker.formatDate("mm/dd/yy", new Date(contextfromdate));
    thesetting["ContextToDate"] = $.datepicker.formatDate("mm/dd/yy", new Date (contexttodate));
    thesetting["MapGrid"] = "Map";
    thesetting["EventSiteDropdownSelected"] = $("#siteList").val();
    thesetting["staticPeriod"] = $("#staticPeriod").val();

    var loc = -1;

    $.each(usersettings.uisettings, function (key, value) {
        if (configname == value.Name) loc = key;
    });

    if (loc == -1) {
        usersettings["uisettings"].push(thesetting);
    } else {
        usersettings.uisettings[loc] = thesetting;
    }

    usersettings["lastSetting"] = "Default";
    $.jStorage.set("usersettings", usersettings);
}

//////////////////////////////////////////////////////////////////////////////////////////////

function showContent() {

    $("#ApplicationContent").css("visibility", "visible");
    $("#logout_button").css("visibility", "visible");
    buildPage();
}

//////////////////////////////////////////////////////////////////////////////////////////////

function getMeters() {

    var thedatasent = "{'userName':'" + postedUserName + "'}";

    $.ajax({
        type: "POST",
        url: './mapService.asmx/getMeters',
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {
            loadsitedropdown(data.d);
            //loadDataForDate();
        },
        failure: function (msg) {
            alert(msg);
        },
        async: false
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function selectStaticPeriod(thecontrol) {
    var theCalculatedDate = new Date();

    if (thecontrol.value != "Custom") {
        $("#datePickerTo").datepicker("setDate", new Date(theCalculatedDate));
        $("#datePickerFrom").datepicker("setDate", new Date(substituteToken(thecontrol.value)));
        loadDataForDate();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {

    postedUserName = $("#postedUserName")[0].innerHTML;

    showContent();
});

//////////////////////////////////////////////////////////////////////////////////////////////

function loadsitedropdown(cache_Meters) {

    $("#siteList").multiselect({
        close: function (event, ui) {
            loadDataForDate();
        },
        minWidth: 250, selectedList: 1, noneSelectedText: "Select Site"
    }).multiselectfilter();

    $.each(cache_Meters, function (key, value) {
        SelectAdd("siteList", value.id, value.name, "selected");
    });

    var selectedsites = getcurrentconfigsetting("EventSiteDropdownSelected");
    if (selectedsites != null) {
        $('#siteList').multiselect("uncheckAll");
        $('#siteList').val(selectedsites);
    }
    else {
        $('#siteList').multiselect("checkAll");
    }

    $('#siteList').multiselect('refresh');
}

//////////////////////////////////////////////////////////////////////////////////////////////

function loadSettingsAndApply() {

    var thedatasent = "{'userName':'" + postedUserName + "'}";
    var url = "./eventService.asmx/getDashSettings";

    $.ajax({
        type: "POST",
        url: url,
        data: thedatasent,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        success: function (data) {

            var settings = eval(data.d);
            // Turn Off Features

            applicationsettings = settings;

            $.each(settings, (function (key, value) {
                if (value.Name == "DashTab") {
                    if (value.Enabled == 'True') {
                        $(value.Value).show();
                    } else {
                        $(value.Value).hide();
                    }
                }


                if (value.Name == "DashImage") {

                }

            }));

        },
        failure: function (msg) {
            alert(msg);
        },
        async: false
    });
}
  
//////////////////////////////////////////////////////////////////////////////////////////////

function buildPage() {

    $(document).bind('contextmenu', function (e) { return false; });

    $.blockUI({ css: { border: '0px' } });

    $(document).ajaxStart(function () {
        timeout = setTimeout(function () {
            $.blockUI({ message: '<div unselectable="on" class="wait_container"><img alt="" src="./images/ajax-loader.gif" /><br><div unselectable="on" class="wait">Please Wait. Loading...</div></div>' });
        }, 1000);
    });

    $(document).ajaxStop(function () {
        if (timeout != null) {
            clearTimeout(timeout);
            timeout = null;
        }

        $.unblockUI();
    });

    $('#delete-dialog').hide();

    $('#modal-dialog').hide();

    var mousemove = null;

    $.ech.multiselect.prototype.options.selectedText = "# of # selected";
    
    $(window).on('resize', function () {

    });
  
    if ($.jStorage.get("usersettings") != null) {
        usersettings = $.jStorage.get("usersettings");
        validatesettings(usersettings);
    } else {
        initializesettings();
    }

    loadconfigdropdown(usersettings.lastSetting);
   
    datafromdate = getcurrentconfigsetting("DataFromDate");
    datatodate = getcurrentconfigsetting("DataToDate");

    contextfromdate = getcurrentconfigsetting("ContextFromDate");
    contexttodate = getcurrentconfigsetting("ContextToDate");

    initializeDatePickers(datafromdate, datatodate);
    getMeters();

   

    $("#staticPeriod")[0].value = getcurrentconfigsetting("staticPeriod");

}

//////////////////////////////////////////////////////////////////////////////////////////////
/// EOF




