# GWBHub
---
## Introduction
---
PC Games On Android & Ports On Android is a game discovery and compatibility database designed to help users explore PC games playable on Android devices and games that have been ported to Android.

The application is built with AppSheet and uses Google Sheets to organize game information across two dedicated databases.

* **PC Games On Android** — Discover PC games that can be played on Android through compatible emulators, applications, and other software solutions.
* **Ports On Android** — Explore games ported to Android from other platforms.
* **Home** — Browse recent additions from both databases in one convenient location.
  
## Compatibility
---
Game compatibility can vary depending on the Android device, processor, GPU, operating system, emulator, graphics drivers, and software configuration.

The database is intended to help users discover games and access available information about their compatibility.

* **PC Games On Android:** Information about PC games running on Android devices.
* **Ports On Android:** Information about games ported to Android.
* **Device information:** View device-related details when provided in a game entry.
* **Game information:** Explore the details available for individual games.

Compatibility information may not be available for every device or game. Results on one device should not be assumed to apply to all Android devices.

## Features
---
* **Unified Home page** — Access recent entries from both game databases.
* **Latest entries** — Display the four newest entries from each database, for up to eight entries in total.
* **Separate databases** — Keep PC games playable on Android distinct from games ported to Android.
* **Game record navigation** — Select a Home page entry to navigate to its corresponding source record.
* **Spreadsheet-backed data** — Maintain game information using Google Sheets.
* **Automated updates** — Use Google Apps Script to support spreadsheet automation, including date-added handling and Home page updates.

## Data Sources
---
The application uses three primary spreadsheet tabs.

* `Home` — Combines recent entries from both databases.
* `PC Games On Android` — Stores PC game entries and their associated information.
* `Ports On Android` — Stores Android port entries and their associated information.

The Home page is designed to display the latest entries while preserving access to the original records in their respective databases.

## Technology
---
The project uses the following technologies:

* [Google Sheets](https://www.google.com/sheets/about/) — Spreadsheet-based data storage.
* [AppSheet](https://www.appsheet.com/) — Application interface, views, and navigation.
* [Google Apps Script](https://developers.google.com/apps-script) — Spreadsheet automation and data management.

## Getting Started
---
The application is intended to be accessed through its AppSheet interface.

Once the application link is available, users can open the app, browse the Home page, and select either database to explore its entries.

* Open the application.
* Browse the latest additions on the Home page.
* Open `PC Games On Android` to explore PC games playable on Android.
* Open `Ports On Android` to explore games ported to Android.
* Select an entry to view its associated game information.

**Application link:** *Add your AppSheet application URL here.*

## Project Status
---
The project is actively being developed and refined. Its databases, navigation, and automation features may evolve as additional information and improvements are introduced.

## Bugs and Issues
---
If you encounter incorrect information, broken navigation, or other application issues, consider documenting the affected game entry and the problem encountered.

When reporting compatibility problems, include relevant details when possible, such as:

* Android device and processor.
* Android version.
* Emulator, application, or port version.
* Graphics driver or configuration, if applicable.
* Steps to reproduce the issue.

## Contributing
---
Accurate game information helps make the database more useful to the Android gaming community.

Suggestions, corrections, and additional compatibility information are welcome, provided that submitted information is accurate and clearly describes the device and software configuration used.

## License
---
Apache

## Note
---
This project is intended for game discovery and informational purposes. It is not affiliated with or endorsed by the owners or publishers of the games listed in the databases.

Users are responsible for ensuring that their use of games, game files, emulators, ports, and related software complies with applicable laws and licensing requirements.

Game names, trademarks, and other intellectual property belong to their respective owners.

---

**Discover PC games playable on Android. Explore Android ports. Find your next game.**
