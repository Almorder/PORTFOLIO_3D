const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const tallyHtml = `    <!-- Tab 1: Progressive Form (Replaced by Tally) -->
    <div id="form-tab" class="tab-content active">
      <iframe data-tally-src="https://tally.so/embed/7R5DOa?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="400" frameborder="0" marginheight="0" marginwidth="0" title="Contact"></iframe>
      <script>var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}</script>
    </div>

    <!-- Tab 2: Calendly Direct Embed -->`;

// Regex to replace everything from "<!-- Tab 1: Progressive Form -->" to "<!-- Tab 2: Calendly Direct Embed -->"
const regex = /<!-- Tab 1: Progressive Form -->[\s\S]*?<!-- Tab 2: Calendly Direct Embed -->/;

const newHtml = html.replace(regex, tallyHtml);

fs.writeFileSync('index.html', newHtml);
console.log('Form replaced successfully!');
