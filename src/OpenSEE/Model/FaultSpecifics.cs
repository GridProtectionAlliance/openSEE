//******************************************************************************************************
//  SystemSettings.cs - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/23/2026 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Data;
using Gemstone.Data;
using Gemstone.Data.Model;

namespace OpenSEE.Models
{
    [TableName("openSee.FaultSpecifics"), UseEscapedName]
    public class FaultSpecifics
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string FaultType { get; set; }
        [FieldDataType(DbType.DateTime2, DatabaseType.SQLServer)]
        public DateTime Inception { get; set; }
        public double DurationMs { get; set; }
        public double DurationCycles { get; set; }
        public double DeltaTime { get; set; }
        public double CurrentMagnitude { get; set; }
        public string Algorithm { get; set; }
        public double Distance { get; set; }
        public double DoubleFaultDistance { get; set; }
        public double DoubleFaultAngle { get; set; }
        [FieldDataType(DbType.DateTime2, DatabaseType.SQLServer)]
        public DateTime StartTime { get; set; }
        public string MeterName { get; set; }

    }
}
