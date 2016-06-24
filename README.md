![openSEE](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/openSEE%20Logo.png)

openSEE is a browser-based wave-form display tool that can be implemented with [openXDA](https://github.com/GridProtectionAlliance/openXDA). A link to openSEE is typically embedded in e-mails automatically produced by openXDA so that e-mail recipients can quickly access the waveforms that triggered DFR and PQ meter events.
openSEE allows two waveforms to be displayed so that comparisons of data can be made - from different channels in the same DFR that triggered the event of from channels in other DFRs. An optional phasor display is also available to easily resolve phase angles.

openSEE is built into [EPRI's Open PQ Dashboard](https://sourceforge.net/projects/epriopenpqdashboard/) and can also be used as a stand-alone application.

openSEE is built in the style of [EPRI's Open PQ Dashboard](https://sourceforge.net/projects/epriopenpqdashboard/) which was developed by GPA under contract to EPRI. Screen shots from openSEE and the Open PQ Dashboard are provided below.

**Where openSEE Fits In:**

![Where it fits in](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/Where%20it%20fits%20in.png)

# Documentation and Support

* openSEE is a part of the [Open PQ Dashboard](https://github.com/GridProtectionAlliance/PQDashboard) and there is currently no documentation solely for openSEE. You can check out some [screenshots](#screenshots) below.
* Get in contact with our development team on our [discussion board](http://discussions.gridprotectionalliance.org/c/gpa-products/opensee).
* Check out the [wiki](https://gridprotectionalliance.org/wiki/doku.php?id=opensee:overview).

# Deployment

* To install openSEE:
  1. Make sure your system meets all the [requirements](#requirements) below.
  * Choose a [download](#downloads) below.
  * Unzip if necessary.
  * Run "openSEE.msi".
  * Follow the setup wizard.
  * Enjoy.
* To use openSEE:
  1. Use a web browser to navigate to: "machine-where-openSEE-is-installed/opensee/"

## Requirements
* To install openSEE you need:
  * 64-bit Windows 7 or newer.
  * .NET 4.6 or newer.
  * [openXDA](https://github.com/GridProtectionAlliance/openXDA).
  * IIS webserver.
    * ASP.NET 4.6.
    * Windows Authentication.
* To use openSEE you need:
  * A compatible web browser such as:
    * Google Chrome.
    * Mozilla Firefox.
    * Internet Explorer 11.


## Downloads
* Download a stable release from our [releases](https://github.com/GridProtectionAlliance/openSEE/releases) page.

# Contributing
If you would like to contribute please:

1. Read our [styleguide.](https://www.gridprotectionalliance.org/docs/GPA_Coding_Guidelines_2011_03.pdf)
* Fork the repository.
* Work your magic.
* Create a pull request.

# Screenshots

**Fault Example:**
![FaultExample](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/OpenSeeFaultExample.png)

**Fault Example Zoomed:**
![FaultExampleZoomed](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/OpenSeeFaultExampleZoomed.png)

**Fault Specifics Example:**
![FaultSpecificsExample](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/FaultSpecificsExample.png)

**Sag Example:**
![SagExample](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/OpenSeeSagExample.png)

**PQI Fault Example:**
![PQIFaultExample](https://raw.githubusercontent.com/GridProtectionAlliance/openSEE/master/readme%20files/PQIFaultExample.png)
