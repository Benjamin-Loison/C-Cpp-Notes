

/** Load Javascript at runtime */
async function load_javascript (url, location){
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', url);
    scriptTag.setAttribute('type','text/javascript');
    location.appendChild(scriptTag);

    var p = new Promise( (resolve, reject) => {
        scriptTag.onload = resolve;
    });

    return p;
};

function hideNavBar(){
    var toc = document.querySelector("#table-of-contents");
    toc.style.display = "none";
    // document.documentElement.style.setProperty('--main-width', '90%');
    document.querySelector("body")
        .style
        .setProperty("margin-left", "100px");
    
    // button.style.left = "10px";
}

function showNavBar(){
    var toc = document.querySelector("#table-of-contents");
    toc.style.display = "block";
    // document.documentElement.style.setProperty('--main-width', '100%');
    document.querySelector("body")
        .style
        .setProperty("margin-left", "250px");
    
    // button.style.left = "25%";
}

var buttonFlag = false; 



var openTOCMenu = function(){
    var toc = document.querySelector("#table-of-contents");
    toc.style.setProperty("height", "100%");
    toc.style.setProperty("overflow-y", "scroll");
}

var closeTOCMenu = function(){
   
    var toc = document.querySelector("#table-of-contents");
    toc.scrollTop = 0 ;
    toc.style.setProperty("height", "50px");
    toc.style.setProperty("overflow-y", "hidden");
}

var isOverflown = function(element) {
	// Vertical overflow
    return element.scrollHeight > element.clientHeight; 
    // Horizontal overflow
    // || element.scrollWidth > element.clientWidth;
}

function addCodeExpansionButton()
{
    codes = document.querySelectorAll("pre");   
	
	if(window.screen.width <= 960)
	{  // Mobile	   	
	   maxHeight = "200px";	
	   btnLeftPosition = "70%";	   
	} else {
		// Desktop
	   maxHeight = "400px";
	   btnLeftPosition = "90%";
	}		
    
    codes.forEach(x => {
		
		if(!isOverflown(x)) return;
		
		var button = document.createElement("button");
		button.textContent     = "Expand";						
		button.style.position  = "relative";
		button.style.top       = "5px";
		button.style.bottom    = "5px";
		button.style.left      = btnLeftPosition;
		button.style.backgroundColor = "black";
        button.style.color = "white";
		x.parentNode.insertBefore(button, x);		
		
		flag = false;
		button.addEventListener("click", () => {
			
			if(flag == false){
				x.style.maxHeight = "none";			
				flag = true;
			} else {
				flag = false;
				x.style.maxHeight = maxHeight;			
			}
		});
		
	});		
}

function append_html(dom_elem, html)
{
   var temp = document.createElement("template");
   temp.innerHTML = html.trim(); 
   var elem = temp.content.firstChild;
   dom_elem.appendChild(elem);
   return elem; 
}

class LocalStorageString {
    
    constructor(name, value) {
        this.name = name;
        this.observers = [];
        this._dummy = (function () {
            var q = localStorage.getItem(name);
            if (q == null || q == "undefined") {
                localStorage.setItem(name, value);
            }
        } ());
    }

    add_observer(observer_function)
    {
        this.observers.push(observer_function);
    };

    notify(){
        for(let callback of this.observers) callback(this);
    };

    get(){
        var result = localStorage.getItem(this.name);
        console.assert( result != "undefined"  );
        return result;
    };
    
    set(value){ 
       localStorage.setItem(this.name, value);
       this.notify();
    }

};

class LocalStorageList {

    constructor(name, value, options) {
        this.name         = name;
        this.defaut_value = value;
        this.options      = options;
        this.observers    = [];

    }

    add_observer(observer_function)
    {
        this.observers.push(observer_function);
    }

    notify(){
        for(let callback of this.observers) callback(this);
    };


    get(){
        var result = localStorage.getItem(this.name);
        console.assert( result != "undefined"  );
        if(result == null || result == "undefined") { 
            return this.defaut_value; 
        }
        return result;
    };

    getSelectedValue() {
        var index = this.get();
        var opt   = this.options[index];
        // console.log(` Index = ${index} ; opt = ${opt} `);
        return opt["value"];
    }
    
    set(value){ 
       if(value == this.get()) { return; }
       localStorage.setItem(this.name, value);
       this.notify();
    }

    bind_list(list_like_widget)
    {
        var selectbox = document.querySelector(list_like_widget);
        console.assert(selectbox, "selectbox not supposed to be null");
        
        // console.log(" this.options = ", this.options);

        for(let row in this.options) {
            var opt   = document.createElement("option");
            // console.log(" row = ", row);
            opt.text  = this.options[row]["text"];
            opt.value = this.options[row]["value"];
            selectbox.add(opt, -1);
        }

        selectbox.selectedIndex = this.get();

        var self = this;

        selectbox.addEventListener("change", () => {
            console.log(" Self = ", self);
            self.set( selectbox.selectedIndex );
        });

        this.add_observer(sender => {
            var index = sender.get();
            selectbox.selectedIndex = index;
        });

        this.notify();
    }

    bind_list_when_loaded(list_like_widget)
    {
        let self = this;
        document.addEventListener("DOMContentLoaded", () => { 
            self.bind_list(list_like_widget);
        }, false);
    }
};

function set_light_theme()
{
    var dom_content = document.querySelector("#content");
    const theme_dark  = "theme-dark-content";
    const theme_light = "theme-light-content";

    var dom_content = document.querySelector("#content");   
    var cls = dom_content.classList;
    if( cls.contains(theme_dark))  cls.remove(theme_dark);
    if(!cls.contains(theme_light)) cls.add(theme_light);  
}

function set_dark_theme()
{
    const theme_dark  = "theme-dark-content";
    const theme_light = "theme-light-content";

    var dom_content = document.querySelector("#content");   
    var cls = dom_content.classList;
    if(!cls.contains(theme_dark))  cls.add(theme_dark);
    if( cls.contains(theme_light)) cls.remove(theme_light);       
}

const theme_mode_dark = "dark_mode";
const theme_mode_light = "light_mode";
const storage_theme = new LocalStorageString("theme", theme_mode_light);

storage_theme.add_observer( sender => {
    console.trace("Theme updated. Ok");
    var theme = sender.get();

    var selector = document.querySelector("#theme-selector")

    if(theme == theme_mode_dark){ 
        set_dark_theme(); 
        selector.selectedIndex = 1;
    }
    if(theme == theme_mode_light){
        set_light_theme();
        selector.selectedIndex = 0;
    }
});

const storage_code_font_size = new LocalStorageList("code-font-size", 0, 
     [ 
        {text: "8pt",  value: "8pt"  }
      , {text: "10pt", value: "10pt" }
      , {text: "12pt", value: "12pt" }
    ]);

// storage_code_font_size.bind_list_when_loaded("#selector-font-code");

storage_code_font_size.add_observer( sender => { 
    var font_size = sender.getSelectedValue(); 
    document.documentElement.style.setProperty('--font-source-size', font_size);
});

const storage_text_font_size = new LocalStorageList("text-font-size", 0, 
    [
        {text: "8pt",  value: "8pt"  }
      , {text: "10pt", value: "10pt" }
      , {text: "12pt", value: "12pt" }
      , {text: "14pt", value: "14pt" }
    ]); 

storage_text_font_size.add_observer( sender => {
    var font_size = sender.getSelectedValue();     
    document.documentElement.style.setProperty('--text-font-size', font_size);
});

const id_selector_content_font = "selector-content-font";


const storage_heading_font = new LocalStorageList("font-heading", 0, 
    [
          {text: "Orbitron",        value: "orbitron"       }
        , {text: "Denmark",         value: "denmark"        }
        , {text: "Arial",           value: "arial"          }
        , {text: "Hornet",          value: "hornet"         }
        , {text: "Stencil 1",       value: "stencil1"       }
        , {text: "Stencil 2",       value: "stencil2"       }
        , {text: "StkMedieval",     value: "stkmedieval"    }
        , {text: "Fraktur",         value: "fraktur"        }
        , {text: "Hermite Regular", value: "hermit-regular" }
        , {text: "Iceland",         value: "iceland"        }
    ]); 

storage_heading_font.add_observer(sender => {
    let font = sender.getSelectedValue(); 
    // CSS property containing font name is changed by this callback.
    document.documentElement.style.setProperty('--font-headers', font);
});



const storage_content_font = new LocalStorageList("font-content", 0, 
    [
            // Label is the font type and value is the font CSS typeface name defined 
            // in the file org-nav-theme.css 
          {text: "monospace",       value: "monospace"      }
        , {text: "spectral",        value: "spectral"       }
        , {text: "arial",           value: "arial"          }
        , {text: "hornet",          value: "hornet"         }
        , {text: "fira code",       value: "fira-code-mono" }
        , {text: "Go mono",         value: "go-mono"        }
        , {text: "Go regular",      value: "go-regular"     }
        , {text: "Liden Hill",      value: "liden-hill"     }
        , {text: "Hermit Regular",  value: "hermit-regular" }
        , {text: "Rajdhani",        value: "rajdhani"       }
        , {text: "Literata",        value: "literata"       }
        , {text: "Roboto Serif",    value: "roboto"         }

    ]); 

storage_content_font.add_observer(sender => {
    let font = sender.getSelectedValue(); 
    document.documentElement.style.setProperty('--font-content', font);
});

const storage_code_font_type = new LocalStorageList("code-font-type", 1, 
    [
          {text: "monospace",        value: "monospace"              }
        , {text: "Iosevka",          value: "code-Iosevka"           }
	    , {text: "tech mono",        value: "share-tech-mono"        }
        , {text: "fira code",        value: "fira-code-mono"         }
        , {text: "fira code medium", value: "fira-code-medium-mono"  }
        , {text: "Go mono",          value: "go-mono"                }
        , {text: "JetBrains mono",   value: "jetbrains-mono"         }
        , {text: "Hermit Regular",   value: "hermit-regular" }
    ]);

storage_code_font_type.add_observer( sender => {
    let font = sender.getSelectedValue();
    document.documentElement.style.setProperty('--font-source-code', font);
});

function fold_event_install()
{

    var outlines = document.querySelectorAll(".outline-3");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        arr.forEach(x => x.hidden = !x.hidden );
    }

    var outlines = document.querySelectorAll(".outline-4");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        arr.forEach(x => x.hidden = !x.hidden );
    }
}

function fold_content_install_event()
{
    var outlines = document.querySelectorAll(".outline-3");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        h2.addEventListener("click", () => {
            arr.forEach(x => x.hidden = !x.hidden );
        })
    }

    var outlines = document.querySelectorAll(".outline-4");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        h2.addEventListener("click", () => {
            arr.forEach(x => x.hidden = !x.hidden );
        })
    }
}

function fold_content()
{

    var outlines = document.querySelectorAll(".outline-3");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        arr.forEach(x => x.hidden = !x.hidden );
    }

    var outlines = document.querySelectorAll(".outline-4");
    for(let out of outlines){
        let arr = [].slice.call(out.children);
        let h2  = arr.shift();
        arr.forEach(x => x.hidden = !x.hidden );
    }
}

function startControlPanel(isMobile) {
    var toc = document.querySelector("#table-of-contents");
    var to  = document.querySelector("#table-of-contents h2");

    var el = document.createElement("template");
    el.innerHTML = `
    <div class="control-panel"> 

        <button class="util-btn" id="btn-config" title="User settings">
            <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(3 5)"><g stroke="#2a2e3b" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 1.5h8"/><path d="m4.5 5.498h5"/><path d="m4.5 9.5h8"/></g><path d="m1.49884033 2.5c.5 0 1-.5 1-1s-.5-1-1-1-.99884033.5-.99884033 1 .49884033 1 .99884033 1zm0 4c.5 0 1-.5 1-1s-.5-1-1-1-.99884033.5-.99884033 1 .49884033 1 .99884033 1zm0 4c.5 0 1-.5 1-1s-.5-1-1-1-.99884033.5-.99884033 1 .49884033 1 .99884033 1z" fill="#2a2e3b"/></g></svg>
        </button>

        <button class="util-btn" id="btn-navigate" title="Faster navigation">
            <svg  height="21" viewBox="0 0 21 21" width="21"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path class="heroicon-ui" d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
                </svg>
        </button>
 
        
        <button class="util-btn" id="btn-top" title="Go to top of page">
            <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#2a2e3b" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 -1 1 0 2 19)"><circle cx="8.5" cy="8.5" r="8"/><path d="m11.621 6.379v4.242h-4.242" transform="matrix(.70710678 .70710678 .70710678 -.70710678 -3.227683 7.792317)"/><path d="m8.5 4.5v8" transform="matrix(0 1 -1 0 17 0)"/></g></svg>
        </button>
        
        <button class="util-btn" id="btn-bottom" title="Go to bottom of page">
            <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#2a2e3b" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 -1 0 20 2)"><circle cx="8.5" cy="8.5" r="8"/><path d="m11.621 6.379v4.242h-4.242" transform="matrix(.70710678 .70710678 .70710678 -.70710678 -3.227683 7.792317)"/><path d="m8.5 4.5v8" transform="matrix(0 1 -1 0 17 0)"/></g></svg>
        </button>
        
        <button  class="util-btn" id="btn-index" title="Go to index page">
            <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#2a2e3b" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)"><path d="m2.5.5h12c1.1045695 0 2 .8954305 2 2v12c0 1.1045695-.8954305 2-2 2h-12c-1.1045695 0-2-.8954305-2-2v-12c0-1.1045695.8954305-2 2-2z"/><path d="m.5 4.5h16"/></g></svg>
        </button>
    <div>
    `.trim();        

    var elem = el.content.firstChild;
    var parent = document.body;
    parent.appendChild(elem);

   var dialog_code = `
    <dialog id="user-settings" class="config-dialog"> 
        <h3>User Settings</h3>

        <table> 
            <tr> 
                <th class="row-label">Theme mode</th> 
                <th class="row-item"> 
                    <select id="theme-selector" title="Select theme mode light/dark">
                        <option value="light_mode">Light mode</option>
                        <option value="dark_mode">Dark mode</option>           
                    </select>
                </th> 
            </t> 

            <tr> 
                <th class="row-label">Text's font size</th>
                <th class="row-item"> 
                    <select id="selector-font-text" title="Select code block font size">                   
                    </select>
                </th> 
            </tr> 
            
            <tr> 
                <th class="row-label">Source code's font size</th>
                <th class="row-item"> 
                    <select id="selector-font-code" title="Select code block font size">                    
                    </select>
                </th> 
            </tr> 
            
           <tr> 
                <th class="row-label">Heading font type</th>
                <th class="row-item"> 
                    <select id="selector-font-heading" title="Select heading (titles) font">                    
                    </select>
                </th> 
            </tr>             

            <tr> 
                <th class="row-label">Content font type</th>
                <th class="row-item"> 
                    <select id="${id_selector_content_font}" title="Select font for content">                    
                    </select>
                </th> 
            </tr>             


            <tr> 
                <th class="row-label">Code font type</th>
                <th class="row-item"> 
                    <select id="selector-font-code-type" title="Select code font type">                    
                    </select>
                </th> 
            </tr>  

        </table>

        <button id="btn-close">Close</button>

    </dialog>
    `;
    dialog = append_html(document.body, dialog_code);
    dialog.querySelector("#btn-close").addEventListener("click", () => { 
        dialog.close();
        console.log(" [INFO] Dialog closed Ok.")
    });
    dialog.querySelector("#theme-selector").addEventListener("change", () => { 
        var sender = dialog.querySelector("#theme-selector");
        if(sender.value == "dark_mode" ) storage_theme.set(theme_mode_dark);
        if(sender.value == "light_mode") storage_theme.set(theme_mode_light);
        // alert(" Theme changed Ok to " + sender.value);
    });

    elem.querySelector("#btn-config").addEventListener("click", () => {
        dialog.showModal();
    });

    elem.querySelector("#btn-top").addEventListener("click", () => {
        // console.log("Click Button TOP");

        var elem =  document.querySelector("#content");
        // var doc = document.documentElement || document;
        // doc.scrollTop = elem.scrollHeight; 
        elem.scrollTop = 0;

        var doc = document.documentElement || document;
        doc.scrollTop = 0;
    });

    elem.querySelector("#btn-bottom").addEventListener("click", () => {
        console.log("Click button bottom");
        // window.scrollTo(0,document.body.scrollHeight);

        var elem =  document.querySelector("#content");
        // var doc = document.documentElement || document;
        // doc.scrollTop = elem.scrollHeight; 
        elem.scrollTop = elem.scrollHeight;

        var elem =  document.querySelector("#content");
        var doc = document.documentElement || document;
        doc.scrollTop = elem.scrollHeight;
    
    });
    
    elem.querySelector("#btn-index").addEventListener("click", () => {
        console.log("Click button index");
        window.location = "index.html";
    });
    
    addCodeExpansionButton();        

    dialogPolyfill.registerDialog(dialog);

    /** ------------- Search Dialog  ---------------------  */

    var dialog_navigate_code = `
        <dialog id="dialog-navigate" class="config-dialog">
            <h3>Navigation helper / Jump to heading</h3>
            <p>
              Type the section you want to jump here. 
              Note: This text  entry input has auto html5 completion. 
            </p>
            <b>Dialog Shortcut</b>
            The shortcut for this dialog on the keyboard is (.) dot key.
            <hr>
            </br>
            <label>Seaction:</label>
            <input id="entry-navigation" list="nav-datalist">
            <datalist id="nav-datalist"></datalist>
            </br>
            <hr>
            <button id="btn-nav-go">Go</button> 
            <button id="btn-nav-clear">Clear</button> 
            <button id="btn-nav-close">Close</button> 
        </dialog>
    `;

    dialog_navigate = append_html(document.body, dialog_navigate_code);
    dialogPolyfill.registerDialog(dialog_navigate);

    dialog_navigate.querySelector("#btn-nav-close").addEventListener("click", () => {
        dialog_navigate.close();
    });

    elem.querySelector("#btn-navigate").addEventListener("click", () => {
        // alert(" I was clicked."); 
        dialog_navigate.showModal();
    });
    
    let headers = document.querySelectorAll("#table-of-contents a");
    console.log(" headers = ", headers);
    let counter = 0;

    let ctx = document.querySelector("#content");
    let count = 0;

    // Install keyboard shortcut. dot (.) for showing navigation modal dialog
    document.onkeydown = (keyDownEvent) => {
        //console.log(" Key = ", keyDownEvent.key);
       //  keyDownEvent.preventDefault()
        if( keyDownEvent.key === "."){ dialog_navigate.showModal(); }

        if( keyDownEvent.key == "u" )
        {
             //window.scrollTo(0,  window.scrollHeight / 2);           
            window.scrollBy({top: -window.innerHeight / 2, left: 0,  });
            console.log(" [TRACE] Scrolling up. Ok")
        }

        if( keyDownEvent.key == "d" )
        {

            window.scrollBy({top: +window.innerHeight / 2, left: 0, });
            console.log(" [TRACE] Scrolling down. Ok")
        }

        // Fold content
        if( keyDownEvent.key == "F")
        {
            console.log(" [TRACE] Called fold content - typed 'g' ")
            fold_content();
        }

        // Go to next heading by typing '0' or '('
        if( keyDownEvent.which == 48 && counter < headers.length ){
           counter++;
           document.location = headers[counter].href;
        }
        
        // Go to previous heading by typing '9' or ')'
        if( keyDownEvent.which == 57  && counter >= 0 ){
            counter--;
            document.location = headers[counter].href;
        }
    };

    let datalist = dialog_navigate.querySelector("#nav-datalist");
    let links = document.querySelectorAll("#table-of-contents a");

    for(let a of links){
        let opt = document.createElement("option");
        opt.value = a.innerText;
        opt.setAttribute("data-key", a.href);
        console.log(" [TRACE] opt = ", opt);
        datalist.appendChild(opt);
    }

    let entry_box = dialog_navigate.querySelector("#entry-navigation");

    function navigate_go(){
        let entry = entry_box.value;
        let nodes = datalist.childNodes;
        console.log(" [CALLED] btn-nav-go!");
        console.log(" Entry = ", entry);
        // Get the node selected by user
        for(let n of nodes){
            console.trace(" [TRACE] Node = ", n);
            if(n.value == entry){
                console.log(" [TRACE] node = ", n);
                // Go to page location that the user selected
                location.href = n.getAttribute("data-key");
                break;
            }
        }

        dialog_navigate.close();
    }

    entry_box.addEventListener("keypress", (event) => {
        // User hit RETURN
        if(event.keyCode == 13){
            console.log(" [INFO] User hit RETURN key");
            navigate_go(); 
        }
    });


    dialog_navigate.querySelector("#btn-nav-go").addEventListener("click", () => {
        navigate_go();
    });

    dialog_navigate.querySelector("#btn-nav-clear").addEventListener("click", () => {
        entry_box.value = "";
    });



    /** ---- Table of Content Folding button -------------- */
    if(isMobile){
        // alert(" MOBILE MODE");

       // fold_content();

        var tocTitle = document.querySelector("#table-of-contents h2");
        tocTitle.textContent = "TOC";
        tocTitle.style.color = "black";
    
        var tocOpened = false;
        
        to.addEventListener("click", function(){
            // console.log("tocOpened = " + tocOpened);
            if(!tocOpened){
                openTOCMenu();
                tocOpened = true;
            }
            else {            
                closeTOCMenu();
                tocOpened = false;
            }
        });
    
        
        var tocLinks = document.querySelectorAll("#table-of-contents a");
        tocLinks.forEach(a => a.addEventListener("click", closeTOCMenu));
        
    }

    if(!isMobile){

    }
    

}; // --- End of function initMobileTocMenu() ------------ //

function toggle_theme() {
    var dom_content = document.querySelector("#content");
    dom_content.classList.toggle("theme-light-content");    
    dom_content.classList.toggle("theme-dark-content");    

}

var init = async function(){

    await load_javascript("theme/dialog-polyfill.js", document.body);
        
    console.trace(" Script loaded. Ok. ");

    var isMobile = window.screen.width <= 960;
    startControlPanel(isMobile);
    
    if(window.screen.width > 960) {
        const xoffset = 50;
        var ypos = 50;

        var cont = document.querySelector("#content");
        var boundRectangle = cont.getBoundingClientRect();
        var xpos = boundRectangle.x + boundRectangle.width + xoffset + "px";
        var body = document.querySelector("body");

        var ctpanel = document.querySelector(".control-panel");        
        ctpanel.style.width  = "50px";
        ctpanel.style.top  = "200px"; 
        ctpanel.style.left = "1080px";
        // console.log("Control panel style = ", ctpanel.style);
    }    


    storage_code_font_size.bind_list("#selector-font-code");
    storage_text_font_size.bind_list("#selector-font-text");
    storage_heading_font.bind_list("#selector-font-heading");

    storage_code_font_type.bind_list("#selector-font-code-type");
   // storage_code_font_size.notify();

    storage_theme.notify();
    
    storage_text_font_size.notify();
    storage_content_font.notify();

    storage_content_font.bind_list("#" + id_selector_content_font);

    // ----- Fold Menu --------------//
    fold_content_install_event();

    let links = document.querySelectorAll("a");
    let origin = document.location.origin;

    // Open links with origin not equal to the current page origin in a new tab.
    links.forEach(lnk => {
        if( lnk.origin == origin ){ return; }
        lnk.addEventListener("click", (event) => {
            event.preventDefault();
            const tab = window.open(lnk.href, "_blank");
        });
    })
    
  /*   var dom_content = document.querySelector("#content");
    dom_content.classList.toggle("theme-light-content");     */
}


document.addEventListener("DOMContentLoaded", init, false);

// document.addEventListener("DOMContentLoaded", init, false);

