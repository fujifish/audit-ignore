#!/usr/bin/env node
/* eslint-disable security/detect-child-process */
/* eslint-disable no-console */
const fs = require("fs");
const exec = require("child_process").execSync;

(async function() {
  try {
    exec("npm audit --json");
  } catch (e) {
    // vulnerabilties exist
    let ignore = [];
    try {
      // vulnerabilities to ignore
      ignore = fs
        .readFileSync(".auditignore", "utf8")
        .split("\n")
        .map(ad => ad.trim());
    } catch (e) {
      // ignore
    }
    const stdout = e.stdout.toString();
    const stderr = e.stderr.toString();
    // the process of "npm audit" exited with status code 1
    if (e.status === 1) {
      let vulns = JSON.parse(stdout);
      if (vulns.advisories) {
        let findings = [];
        Object.keys(vulns.advisories).forEach(adv => {
          // look for advisories that are not ignored
          if (ignore.indexOf(adv) === -1) {
            findings.push(adv);
          }
        });
        // there are findings -> error
        if (findings.length > 0) {
          console.log(stdout);
          process.exit(1);
        }
      }
    } else {
      // something else happened
      console.log(stdout);
      console.log(stderr);
    }
  }
})();
