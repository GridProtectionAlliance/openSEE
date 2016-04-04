<!--
//******************************************************************************************************
//  OpenSEENav.aspx - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/06/2016 - Jeff Walker
//       Generated original version of source code.
//
//******************************************************************************************************
-->

<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OpenSEENav.aspx.cs" Inherits="OpenSEENav" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>openSEE Navigation</title>

    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />

    <link rel="shortcut icon" type="image/ico" href="./images/openSEE.ico" />
    <link rel="stylesheet" href="./css/themes/redmond/jquery-ui.css" />
    <link rel="stylesheet" href="./js/PrimeUI/Font-Awesome/css/font-awesome.min.css" />
    <link rel="stylesheet" href="./js/PrimeUI/primeui.min.css" />
    <link rel="stylesheet" href="./css/jquery.multiselect.css" />
    <link rel="stylesheet" href="./css/jquery.multiselect.filter.css" />
    <link rel="stylesheet" href="./css/OpenSEENav.css" type="text/css" />
    
   
    <script type="text/javascript" src="./js/jquery-2.1.1.js"></script>   
    <script type="text/javascript" src="./js/jquery-ui.js"></script>
    <script type="text/javascript" src="./js/PrimeUI/primeui.js"></script>
    <script type="text/javascript" src="./js/PrimeUI/x-tag-core.min.js"></script>
    <script type="text/javascript" src="./js/PrimeUI/primeelements.js"></script>
    <script type="text/javascript" src="./js/jquery.blockUI.js"></script>
    <script type="text/javascript" src="./js/jquery.multiselect.js"></script>
    <script type="text/javascript" src="./js/jquery.multiselect.filter.js"></script>
    
    <script type="text/javascript" src="./js/OpenSEENav.js?ver=<%=DateTime.Now.Ticks.ToString()%>"></script>
    <script type="text/javascript" src="./js/jstorage.js"></script> 
    <script type="text/javascript" src="./js/moment.js"></script> 

</head>
    <body onunload="createupdateconfig(null);">
    
        <div style="visibility:hidden; width: 0; height: 0;" id="postedUserName"><%=username %></div>

        <div style="width: 100%; height: 36px;">
            <table style="width: 100%; table-layout: fixed">
                <tr>
                    <td style="text-align: left"><img src="images/GPA-Logo---30-pix(on-white).png" /></td>
                    <td style="text-align: center"><img src="images/openSEELogo.png" /></td>
                    <td style="text-align: right"><img src="images/GPA-Logo.png" style="display: none" /></td>
                </tr>
            </table>
        </div>

        <div id="ApplicationContent"  class="noselect" >
            <div id="headerStrip"  class="headerStrip ui-state-default noselect">
                <table style="width: 100%">
                    <tr>
                        <td style="text-align: center; white-space: nowrap">
                            <select class="smallbutton" id="Configurations" onchange="configurationapply(this);"></select>
                            <button class="smallbutton" id="ConfigurationsCopy" onclick="configurationscopy(this);">New</button>
                            <button class="smallbutton" id="ConfigurationsUpdate" onclick="configurationsupdate(this);">Save</button>
                            <button class="smallbutton" id="ConfigurationsDelete" onclick="configurationsdelete(this);">Delete</button>
                        </td>
                        <td style="text-align: center; white-space: nowrap">
                            Site:
                            <select id="siteList" multiple="multiple">

                            </select>
                        </td>
                        <td style="text-align: center; white-space: nowrap">
                            From:&nbsp;<input type="text" id="datePickerFrom" class="datepicker"/>&nbsp;&nbsp;To:&nbsp;<input type="text" id="datePickerTo" class="datepicker"/>
                            <button class="smallbutton" id="load_for_date_range" style="vertical-align: middle;" onclick="loadDataForDateClick();">Load</button>
                            
                            <select class="smallbutton" id="staticPeriod" onchange="selectStaticPeriod(this);">
                                <option value="Custom"></option>
                                <option value="Today">Today</option>
                                <option value="PastWeek">Today - 7</option>
                                <option value="PastMonth">Today - 30</option>
                                <option value="PastYear">Today - 365</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>

            <div  id="DockDetailContainer" class="dockletcontainer noselect" style="z-index: 999;">
                <div id="DetailEvents" class="docklet" style="z-index: 999;">
                </div>
            </div>

            <div  id="modal-dialog" class="configNameModal" title="New Configuration">
                <table style="margin: 0 auto"><tr><td><label for="newconfigname">Name:</label></td><td><input type="text" id="newconfigname" value="" maxlength="25"/></td></tr></table>
            </div>
                  
            <div  id="delete-dialog" class="configNameModal" title="Delete Confirmation">
                <table style="margin: 0 auto">
                    <tr>
                        <td style="text-align: right; white-space: nowrap">
                                Delete:
                        </td>
                        <td style="text-align: left; white-space: nowrap">
                            <div id="deleteconfigname"></div>
                        </td>
                        <td style="text-align: left; white-space: nowrap">
                            ?
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
</html>
