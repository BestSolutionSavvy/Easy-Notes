/** @type {import('tailwindcss').Config} */
module.exports = {
  	"content": [
    		"./src/**/*.{js,jsx,ts,tsx,vue}"
  	],
  	"theme": {
    		"extend": {
      			"colors": {
        				"whitesmoke": {
          					"100": "#f5f5f5",
          					"200": "#eee"
        				},
        				"white": "#fff",
        				"gray": {
          					"100": "#fefefe",
          					"200": "#787878",
          					"300": "#1e1e1e"
        				},
        				"darkslategray": "#484848",
        				"gainsboro": "#d9d9d9",
        				"darkslateblue": "#25356e",
        				"orangered": "#da3a00"
      			},
      			"fontFamily": {
        				"inter": "Inter"
      			},
      			"borderRadius": {
        				"num-10": "10px",
        				"num-8": "8px"
      			},
      			"padding": {
        				"num-12": "12px"
      			}
    		},
    		"fontSize": {
      			"num-16": "1rem"
    		}
  	},
  	"corePlugins": {
    		"preflight": false
  	}
}