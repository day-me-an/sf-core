# sf-core
[![Build Status](https://travis-ci.org/day-me-an/sf-core.svg?branch=master)](https://travis-ci.org/day-me-an/sf-core)
[![npm version](https://badge.fury.io/js/%40day-me-an%2Fsf-core.svg)](https://badge.fury.io/js/%40day-me-an%2Fsf-core)

This package exports a Redux store and associated actions. It is depended on by each separate platform implementation of SitFinder. It may be a better idea to export a 'core' reducer, rather than an entire store, as this would give more flexibility.

Currently, web (sf-web) has been implemented. It's intended that a single react-native project will be built that also depends on sf-core to support iOS & Android.

There are some alternative libraries such as react-native-web and react-web that attempt to target web and iOS/Android from a single react-native API compatible codebase. The chosen approach would have to be carefully evaluated on an case-by-case basis. There aren't many risks to placing the Redux logic in a separate package that is shared by proven production-ready libraries, but many potential risks with investing in a single monolithic codebase driven by one of these relatively experimental alternative libraries.
