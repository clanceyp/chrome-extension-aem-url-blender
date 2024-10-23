export default [
  {
    "title": "Admin Home",
    "data": [
      {
        "key": "^(http:\\/\\/localhost:4502|https:\\/\\/author.*\\.com).*",
        "value": "$1/aem/start.html",
        "label": "Admin home"
      }
    ],
    "id": "section-0-admin-home",
    "testUrl": "http://localhost:4502/sites.html/content/wknd/us/en/about-us"
  },
  {
    "title": "Admin System",
    "data": [
      {
        "key": "(.*)/aem/start.html",
        "value": "$1/crx/de/index.jsp",
        "label": "CRXde",
        "reResult": [
          "http://localhost:4502/aem/start.html",
          "http://localhost:4502"
        ]
      },
      {
        "key": "",
        "value": "$1/crx/packmgr/index.jsp",
        "label": "Package Manager"
      },
      {
        "key": "",
        "value": "$1/etc/replication.html",
        "label": "Replication"
      },
      {
        "key": "",
        "value": "$1/groovyconsole",
        "label": "Groovy console"
      },
      {
        "key": "",
        "value": "$1/libs/cq/i18n/translator.html",
        "label": "Translator"
      },
      {
        "key": "",
        "value": "$1/libs/granite/ui/content/dumplibs.rebuild.html",
        "label": "ClientLibs"
      },
      {
        "key": "",
        "value": "$1/system/console/bundles",
        "label": "System console"
      },
      {
        "key": "",
        "value": "$1/system/console/slinglog/tailer.txt?name=/logs/error.log&tail=2500",
        "label": "Error log"
      }
    ],
    "id": "section-1-admin-system",
    "testUrl": "http://localhost:4502/aem/start.html"
  },
  {
    "title": "editor.html",
    "data": [
      {
        "key": "(.*)/editor.html/(.*).html",
        "value": "$1/crx/de/index.jsp#/$2",
        "label": "CRXde - with path"
      },
      {
        "key": "",
        "value": "$1/$2.html?wcmmode=disabled",
        "label": "View as Published"
      },
      {
        "key": "",
        "value": "$1/sites.html/$2",
        "label": "View in sites browser"
      },
      {
        "key": "",
        "value": "$1/$2.model.tidy.json",
        "label": "View JSON"
      },
      {
        "key": "",
        "value": "$1/$2.docview.xml",
        "label": "View XML"
      }
    ],
    "id": "section-2-editor-html",
    "testUrl": "http://localhost:4502/editor.html/content/wknd/us/en/about-us.html"
  },
  {
    "title": "Environments - Authoring",
    "data": [
      {
        "key": "(https://author).*\\.com/(.*)",
        "value": "$1-dev.adobeaemcloud.com/$2",
        "label": "env - Dev",
        "reResult": [
          "https://author-dev.adobeaemcloud.com/editor.html/content/wknd/us/en/about-us.html",
          "https://author",
          "editor.html/content/wknd/us/en/about-us.html"
        ]
      },
      {
        "key": "",
        "value": "$1-preprod.adobeaemcloud.com/$2",
        "label": "env - PreProd"
      },
      {
        "key": "",
        "value": "$1-stage.adobeaemcloud.com/$2",
        "label": "env - Stage"
      }
    ],
    "id": "section-3-environments---authoring",
    "testUrl": "https://author-dev.adobeaemcloud.com/editor.html/content/wknd/us/en/about-us.html"
  }
]