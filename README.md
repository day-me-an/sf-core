# sf-core
[![Build Status](https://travis-ci.org/day-me-an/sf-core.svg?branch=master)](https://travis-ci.org/day-me-an/sf-core)
[![npm version](https://badge.fury.io/js/%40day-me-an%2Fsf-core.svg)](https://badge.fury.io/js/%40day-me-an%2Fsf-core)

This package exports a Redux store that is depended on by each native platform implementation of SitFinder: web, iOS & Android.

In a real-world app, it may be a better idea to export a 'core' reducer, rather than an entire store. This would give more flexibility.
