// Function to get translated AddContents array
// Function to get translated AddContents array for ALL icons
export const getAddContents = (t) => {
    const uniqueServices = new Map();

    // Invert the baseUrlIcons to group by icon URL and get a primary name
    for (const domain in baseUrlIcons) {
        if (typeof baseUrlIcons[domain] === 'function') continue; // Skip the fallback function

        const src = baseUrlIcons[domain];
        if (!uniqueServices.has(src)) {
            let name = 'link'; // Default name

            // Attempt to parse a clean name from the URL or domain
            // Case 1: Custom Sirv URL
            let match = src.match(/\/brands\/([^/]+?)\.svg/);
            if (match) {
                name = match[1].toLowerCase().replace(/ /g, '_');
            }
            // Case 2: Google Favicon URL
            else {
                match = src.match(/domain=([^&]+)/);
                if (match) {
                    name = match[1].replace(/^www\./, '').split('.')[0];
                }
                // Fallback to the domain key if parsing fails
                else {
                    name = domain.replace(/^www\./, '').split('.')[0];
                }
            }
            
            // Sanitize name to be a valid key
            name = name.replace(/-/g, '_').replace(/\./g, '_');

            uniqueServices.set(src, {
                name: name,
                src: src,
                alt: name
            });
        }
    }

    // Convert the Map to the final array format for the UI
    return Array.from(uniqueServices.values()).map(service => ({
        src: service.src,
        alt: service.alt,
        title: t(`brandLinks.${service.name}`),
        p: t(`brandLinks.${service.name}_description`),
    }));
};


export const baseUrlIcons = {
  // Existing entries (keeping your original linktree.sirv.com URLs)
  'vm.tiktok.com': 'https://linktree.sirv.com/Images/brands/tiktok.svg',
  'tiktok.com': 'https://linktree.sirv.com/Images/brands/tiktok.svg',
  'www.tiktok.com': 'https://linktree.sirv.com/Images/brands/tiktok.svg',
  'm.tiktok.com': 'https://linktree.sirv.com/Images/brands/tiktok.svg',
  'audiomack.com': 'https://linktree.sirv.com/Images/brands/audiomack.svg',
  'www.audiomack.com': 'https://linktree.sirv.com/Images/brands/audiomack.svg',
  'twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'www.twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'mobile.twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'es.twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'fr.twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'jp.twitter.com': 'https://linktree.sirv.com/Images/brands/twitter.svg',
  'github.com': 'https://linktree.sirv.com/Images/brands/github.svg',
  'www.github.com': 'https://linktree.sirv.com/Images/brands/github.svg',
  'www.linkedin.com': 'https://linktree.sirv.com/Images/brands/linkedin.svg',
  'linkedin.com': 'https://linktree.sirv.com/Images/brands/linkedin.svg',
  'in.linkedin.com': 'https://linktree.sirv.com/Images/brands/linkedin.svg',
  'fr.linkedin.com': 'https://linktree.sirv.com/Images/brands/linkedin.svg',
  'es.linkedin.com': 'https://linktree.sirv.com/Images/brands/linkedin.svg',
  'open.spotify.com': 'https://linktree.sirv.com/Images/brands/spotify.svg',
  'play.spotify.com': 'https://linktree.sirv.com/Images/brands/spotify.svg',
  'i.spotify.com': 'https://linktree.sirv.com/Images/brands/spotify.svg',
  'd.spotify.com': 'https://linktree.sirv.com/Images/brands/spotify.svg',
  'www.youtube.com': 'https://linktree.sirv.com/Images/brands/youtube.svg',
  'm.youtube.com': 'https://linktree.sirv.com/Images/brands/youtube.svg',
  'youtube.com': 'https://linktree.sirv.com/Images/brands/youtube.svg',
  'studio.youtube.com': 'https://linktree.sirv.com/Images/brands/youtube.svg',
  'www.reddit.com': 'https://linktree.sirv.com/Images/brands/reddit.svg',
  'reddit.com': 'https://linktree.sirv.com/Images/brands/reddit.svg',
  'old.reddit.com': 'https://linktree.sirv.com/Images/brands/reddit.svg',
  'new.reddit.com': 'https://linktree.sirv.com/Images/brands/reddit.svg',
  'www.paypal.com': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'paypal.com': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'www.sandbox.paypal.com': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'sandbox.paypal.com': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'www.paypal.me': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'paypal.me': 'https://linktree.sirv.com/Images/brands/paypal.svg',
  'www.instagram.com': 'https://linktree.sirv.com/Images/brands/instagram.svg',
  'instagram.com': 'https://linktree.sirv.com/Images/brands/instagram.svg',
  'i.instagram.com': 'https://linktree.sirv.com/Images/brands/instagram.svg',
  'm.instagram.com': 'https://linktree.sirv.com/Images/brands/instagram.svg',
  'www.facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'web.facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'mobile.facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'i.facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'm.facebook.com': 'https://linktree.sirv.com/Images/brands/facebook.svg',
  'tr.ee': 'https://linktree.sirv.com/Images/brands/Linktree.svg',
  'www.linktr.ee': 'https://linktree.sirv.com/Images/brands/Linktree.svg',
  'linktr.ee': 'https://linktree.sirv.com/Images/brands/Linktree.svg',
  'www.threads.net': 'https://linktree.sirv.com/Images/brands/Threads.svg',
  'threads.net': 'https://linktree.sirv.com/Images/brands/Threads.svg',
  'wa.me': 'https://linktree.sirv.com/Images/brands/whatsapp.svg',
  'wa.link': 'https://linktree.sirv.com/Images/brands/whatsapp.svg',
  'web.whatsapp.com': 'https://linktree.sirv.com/Images/brands/whatsapp.svg',
  'co.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'www.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'www.pinterest.co.uk': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'in.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'www.pinterest.ca': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'br.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'au.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'fr.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'mx.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'de.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'es.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'it.pinterest.com': 'https://linktree.sirv.com/Images/brands/pinterest.svg',
  'medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'co.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'www.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'www.medium.co.uk': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'in.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'www.medium.ca': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'br.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'au.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'fr.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'mx.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'de.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'es.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'it.medium.com': 'https://linktree.sirv.com/Images/brands/medium.svg',
  'fabiconcept.online': 'https://linktree.sirv.com/Images/icons/me.gif',

  // Music Platforms - Using Google S2 (Most Reliable)
  'music.apple.com': 'https://www.google.com/s2/favicons?domain=music.apple.com&sz=32',
  'music.youtube.com': 'https://www.google.com/s2/favicons?domain=music.youtube.com&sz=32',
  'soundcloud.com': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32',
  'www.soundcloud.com': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32',
  'm.soundcloud.com': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32',
  'on.soundcloud.com': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32',
  'bandcamp.com': 'https://www.google.com/s2/favicons?domain=bandcamp.com&sz=32',
  'www.bandcamp.com': 'https://www.google.com/s2/favicons?domain=bandcamp.com&sz=32',
  'tidal.com': 'https://www.google.com/s2/favicons?domain=tidal.com&sz=32',
  'www.tidal.com': 'https://www.google.com/s2/favicons?domain=tidal.com&sz=32',
  'listen.tidal.com': 'https://www.google.com/s2/favicons?domain=tidal.com&sz=32',
  'deezer.com': 'https://www.google.com/s2/favicons?domain=deezer.com&sz=32',
  'www.deezer.com': 'https://www.google.com/s2/favicons?domain=deezer.com&sz=32',
  'pandora.com': 'https://www.google.com/s2/favicons?domain=pandora.com&sz=32',
  'www.pandora.com': 'https://www.google.com/s2/favicons?domain=pandora.com&sz=32',
  'music.amazon.com': 'https://www.google.com/s2/favicons?domain=music.amazon.com&sz=32',
  'amazon.music': 'https://www.google.com/s2/favicons?domain=music.amazon.com&sz=32',

  // Video Platforms
  'vimeo.com': 'https://www.google.com/s2/favicons?domain=vimeo.com&sz=32',
  'www.vimeo.com': 'https://www.google.com/s2/favicons?domain=vimeo.com&sz=32',
  'player.vimeo.com': 'https://www.google.com/s2/favicons?domain=vimeo.com&sz=32',
  'twitch.tv': 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32',
  'www.twitch.tv': 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32',
  'm.twitch.tv': 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32',
  'go.twitch.tv': 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32',
  'kick.com': 'https://www.google.com/s2/favicons?domain=kick.com&sz=32',
  'www.kick.com': 'https://www.google.com/s2/favicons?domain=kick.com&sz=32',
  'dailymotion.com': 'https://www.google.com/s2/favicons?domain=dailymotion.com&sz=32',
  'www.dailymotion.com': 'https://www.google.com/s2/favicons?domain=dailymotion.com&sz=32',
  'rumble.com': 'https://www.google.com/s2/favicons?domain=rumble.com&sz=32',
  'www.rumble.com': 'https://www.google.com/s2/favicons?domain=rumble.com&sz=32',

  // Social Media
  'x.com': 'https://www.google.com/s2/favicons?domain=x.com&sz=32',
  'www.x.com': 'https://www.google.com/s2/favicons?domain=x.com&sz=32',
  'snapchat.com': 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=32',
  'www.snapchat.com': 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=32',
  'web.snapchat.com': 'https://www.google.com/s2/favicons?domain=snapchat.com&sz=32',
  'discord.com': 'https://www.google.com/s2/favicons?domain=discord.com&sz=32',
  'www.discord.com': 'https://www.google.com/s2/favicons?domain=discord.com&sz=32',
  'discord.gg': 'https://www.google.com/s2/favicons?domain=discord.com&sz=32',
  'telegram.org': 'https://www.google.com/s2/favicons?domain=telegram.org&sz=32',
  'www.telegram.org': 'https://www.google.com/s2/favicons?domain=telegram.org&sz=32',
  't.me': 'https://www.google.com/s2/favicons?domain=telegram.org&sz=32',
  'web.telegram.org': 'https://www.google.com/s2/favicons?domain=telegram.org&sz=32',
  'signal.org': 'https://www.google.com/s2/favicons?domain=signal.org&sz=32',
  'www.signal.org': 'https://www.google.com/s2/favicons?domain=signal.org&sz=32',
  'clubhouse.com': 'https://www.google.com/s2/favicons?domain=clubhouse.com&sz=32',
  'www.clubhouse.com': 'https://www.google.com/s2/favicons?domain=clubhouse.com&sz=32',
  'mastodon.social': 'https://www.google.com/s2/favicons?domain=mastodon.social&sz=32',
  'joinmastodon.org': 'https://www.google.com/s2/favicons?domain=mastodon.social&sz=32',
  'tumblr.com': 'https://www.google.com/s2/favicons?domain=tumblr.com&sz=32',
  'www.tumblr.com': 'https://www.google.com/s2/favicons?domain=tumblr.com&sz=32',
  'flickr.com': 'https://www.google.com/s2/favicons?domain=flickr.com&sz=32',
  'www.flickr.com': 'https://www.google.com/s2/favicons?domain=flickr.com&sz=32',

  // Professional Networks
  'xing.com': 'https://www.google.com/s2/favicons?domain=xing.com&sz=32',
  'www.xing.com': 'https://www.google.com/s2/favicons?domain=xing.com&sz=32',
  'glassdoor.com': 'https://www.google.com/s2/favicons?domain=glassdoor.com&sz=32',
  'www.glassdoor.com': 'https://www.google.com/s2/favicons?domain=glassdoor.com&sz=32',
  'indeed.com': 'https://www.google.com/s2/favicons?domain=indeed.com&sz=32',
  'www.indeed.com': 'https://www.google.com/s2/favicons?domain=indeed.com&sz=32',
  'angel.co': 'https://www.google.com/s2/favicons?domain=angel.co&sz=32',
  'www.angel.co': 'https://www.google.com/s2/favicons?domain=angel.co&sz=32',
  'wellfound.com': 'https://www.google.com/s2/favicons?domain=wellfound.com&sz=32',
  'www.wellfound.com': 'https://www.google.com/s2/favicons?domain=wellfound.com&sz=32',

  // Code Platforms
  'gitlab.com': 'https://www.google.com/s2/favicons?domain=gitlab.com&sz=32',
  'www.gitlab.com': 'https://www.google.com/s2/favicons?domain=gitlab.com&sz=32',
  'about.gitlab.com': 'https://www.google.com/s2/favicons?domain=gitlab.com&sz=32',
  'bitbucket.org': 'https://www.google.com/s2/favicons?domain=bitbucket.org&sz=32',
  'www.bitbucket.org': 'https://www.google.com/s2/favicons?domain=bitbucket.org&sz=32',
  'sourceforge.net': 'https://www.google.com/s2/favicons?domain=sourceforge.net&sz=32',
  'www.sourceforge.net': 'https://www.google.com/s2/favicons?domain=sourceforge.net&sz=32',
  'codepen.io': 'https://www.google.com/s2/favicons?domain=codepen.io&sz=32',
  'www.codepen.io': 'https://www.google.com/s2/favicons?domain=codepen.io&sz=32',
  'codesandbox.io': 'https://www.google.com/s2/favicons?domain=codesandbox.io&sz=32',
  'www.codesandbox.io': 'https://www.google.com/s2/favicons?domain=codesandbox.io&sz=32',
  'replit.com': 'https://www.google.com/s2/favicons?domain=replit.com&sz=32',
  'www.replit.com': 'https://www.google.com/s2/favicons?domain=replit.com&sz=32',
  'stackblitz.com': 'https://www.google.com/s2/favicons?domain=stackblitz.com&sz=32',
  'www.stackblitz.com': 'https://www.google.com/s2/favicons?domain=stackblitz.com&sz=32',
  'stackoverflow.com': 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=32',
  'www.stackoverflow.com': 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=32',
  'stackexchange.com': 'https://www.google.com/s2/favicons?domain=stackexchange.com&sz=32',
  'www.stackexchange.com': 'https://www.google.com/s2/favicons?domain=stackexchange.com&sz=32',
  'codechef.com': 'https://www.google.com/s2/favicons?domain=codechef.com&sz=32',
  'www.codechef.com': 'https://www.google.com/s2/favicons?domain=codechef.com&sz=32',
  'codeforces.com': 'https://www.google.com/s2/favicons?domain=codeforces.com&sz=32',
  'www.codeforces.com': 'https://www.google.com/s2/favicons?domain=codeforces.com&sz=32',
  'hackerrank.com': 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=32',
  'www.hackerrank.com': 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=32',
  'leetcode.com': 'https://www.google.com/s2/favicons?domain=leetcode.com&sz=32',
  'www.leetcode.com': 'https://www.google.com/s2/favicons?domain=leetcode.com&sz=32',

  // Learning Platforms
  'coursera.org': 'https://www.google.com/s2/favicons?domain=coursera.org&sz=32',
  'www.coursera.org': 'https://www.google.com/s2/favicons?domain=coursera.org&sz=32',
  'edx.org': 'https://www.google.com/s2/favicons?domain=edx.org&sz=32',
  'www.edx.org': 'https://www.google.com/s2/favicons?domain=edx.org&sz=32',
  'udemy.com': 'https://www.google.com/s2/favicons?domain=udemy.com&sz=32',
  'www.udemy.com': 'https://www.google.com/s2/favicons?domain=udemy.com&sz=32',
  'udacity.com': 'https://www.google.com/s2/favicons?domain=udacity.com&sz=32',
  'www.udacity.com': 'https://www.google.com/s2/favicons?domain=udacity.com&sz=32',
  'khanacademy.org': 'https://www.google.com/s2/favicons?domain=khanacademy.org&sz=32',
  'www.khanacademy.org': 'https://www.google.com/s2/favicons?domain=khanacademy.org&sz=32',
  'pluralsight.com': 'https://www.google.com/s2/favicons?domain=pluralsight.com&sz=32',
  'www.pluralsight.com': 'https://www.google.com/s2/favicons?domain=pluralsight.com&sz=32',
  'skillshare.com': 'https://www.google.com/s2/favicons?domain=skillshare.com&sz=32',
  'www.skillshare.com': 'https://www.google.com/s2/favicons?domain=skillshare.com&sz=32',
  'masterclass.com': 'https://www.google.com/s2/favicons?domain=masterclass.com&sz=32',
  'www.masterclass.com': 'https://www.google.com/s2/favicons?domain=masterclass.com&sz=32',

  // E-commerce & Shopping
  'amazon.com': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'www.amazon.com': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.co.uk': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.ca': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.de': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.fr': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.it': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'amazon.es': 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  'ebay.com': 'https://www.google.com/s2/favicons?domain=ebay.com&sz=32',
  'www.ebay.com': 'https://www.google.com/s2/favicons?domain=ebay.com&sz=32',
  'etsy.com': 'https://www.google.com/s2/favicons?domain=etsy.com&sz=32',
  'www.etsy.com': 'https://www.google.com/s2/favicons?domain=etsy.com&sz=32',
  'shopify.com': 'https://www.google.com/s2/favicons?domain=shopify.com&sz=32',
  'www.shopify.com': 'https://www.google.com/s2/favicons?domain=shopify.com&sz=32',

  // Messaging & Communication
  'slack.com': 'https://www.google.com/s2/favicons?domain=slack.com&sz=32',
  'www.slack.com': 'https://www.google.com/s2/favicons?domain=slack.com&sz=32',
  'app.slack.com': 'https://www.google.com/s2/favicons?domain=slack.com&sz=32',
  'teams.microsoft.com': 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=32',
  'zoom.us': 'https://www.google.com/s2/favicons?domain=zoom.us&sz=32',
  'www.zoom.us': 'https://www.google.com/s2/favicons?domain=zoom.us&sz=32',
  'meet.google.com': 'https://www.google.com/s2/favicons?domain=meet.google.com&sz=32',
  'skype.com': 'https://www.google.com/s2/favicons?domain=skype.com&sz=32',
  'www.skype.com': 'https://www.google.com/s2/favicons?domain=skype.com&sz=32',

  // Cloud Storage & Productivity
  'drive.google.com': 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=32',
  'docs.google.com': 'https://www.google.com/s2/favicons?domain=docs.google.com&sz=32',
  'sheets.google.com': 'https://www.google.com/s2/favicons?domain=sheets.google.com&sz=32',
  'slides.google.com': 'https://www.google.com/s2/favicons?domain=slides.google.com&sz=32',
  'dropbox.com': 'https://www.google.com/s2/favicons?domain=dropbox.com&sz=32',
  'www.dropbox.com': 'https://www.google.com/s2/favicons?domain=dropbox.com&sz=32',
  'onedrive.live.com': 'https://www.google.com/s2/favicons?domain=onedrive.live.com&sz=32',
  'www.onedrive.com': 'https://www.google.com/s2/favicons?domain=onedrive.live.com&sz=32',
  'icloud.com': 'https://www.google.com/s2/favicons?domain=icloud.com&sz=32',
  'www.icloud.com': 'https://www.google.com/s2/favicons?domain=icloud.com&sz=32',
  'notion.so': 'https://www.google.com/s2/favicons?domain=notion.so&sz=32',
  'www.notion.so': 'https://www.google.com/s2/favicons?domain=notion.so&sz=32',
  'airtable.com': 'https://www.google.com/s2/favicons?domain=airtable.com&sz=32',
  'www.airtable.com': 'https://www.google.com/s2/favicons?domain=airtable.com&sz=32',
  'trello.com': 'https://www.google.com/s2/favicons?domain=trello.com&sz=32',
  'www.trello.com': 'https://www.google.com/s2/favicons?domain=trello.com&sz=32',
  'asana.com': 'https://www.google.com/s2/favicons?domain=asana.com&sz=32',
  'www.asana.com': 'https://www.google.com/s2/favicons?domain=asana.com&sz=32',
  'monday.com': 'https://www.google.com/s2/favicons?domain=monday.com&sz=32',
  'www.monday.com': 'https://www.google.com/s2/favicons?domain=monday.com&sz=32',

  // Gaming
  'steam.com': 'https://www.google.com/s2/favicons?domain=steam.com&sz=32',
  'store.steampowered.com': 'https://www.google.com/s2/favicons?domain=steam.com&sz=32',
  'steamcommunity.com': 'https://www.google.com/s2/favicons?domain=steam.com&sz=32',
  'epic.games': 'https://www.google.com/s2/favicons?domain=epicgames.com&sz=32',
  'store.epicgames.com': 'https://www.google.com/s2/favicons?domain=epicgames.com&sz=32',
  'www.epicgames.com': 'https://www.google.com/s2/favicons?domain=epicgames.com&sz=32',
  'battle.net': 'https://www.google.com/s2/favicons?domain=battle.net&sz=32',
  'www.battle.net': 'https://www.google.com/s2/favicons?domain=battle.net&sz=32',
  'itch.io': 'https://www.google.com/s2/favicons?domain=itch.io&sz=32',
  'www.itch.io': 'https://www.google.com/s2/favicons?domain=itch.io&sz=32',

  // Finance & Crypto
  'coinbase.com': 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=32',
  'www.coinbase.com': 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=32',
  'pro.coinbase.com': 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=32',
  'binance.com': 'https://www.google.com/s2/favicons?domain=binance.com&sz=32',
  'www.binance.com': 'https://www.google.com/s2/favicons?domain=binance.com&sz=32',
  'kraken.com': 'https://www.google.com/s2/favicons?domain=kraken.com&sz=32',
  'www.kraken.com': 'https://www.google.com/s2/favicons?domain=kraken.com&sz=32',
  'robinhood.com': 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=32',
  'www.robinhood.com': 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=32',
  'venmo.com': 'https://www.google.com/s2/favicons?domain=venmo.com&sz=32',
  'www.venmo.com': 'https://www.google.com/s2/favicons?domain=venmo.com&sz=32',
  'cashapp.com': 'https://www.google.com/s2/favicons?domain=cash.app&sz=32',
  'cash.app': 'https://www.google.com/s2/favicons?domain=cash.app&sz=32',
  'www.cash.app': 'https://www.google.com/s2/favicons?domain=cash.app&sz=32',

  // Travel
  'airbnb.com': 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=32',
  'www.airbnb.com': 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=32',
  'booking.com': 'https://www.google.com/s2/favicons?domain=booking.com&sz=32',
  'www.booking.com': 'https://www.google.com/s2/favicons?domain=booking.com&sz=32',
  'expedia.com': 'https://www.google.com/s2/favicons?domain=expedia.com&sz=32',
  'www.expedia.com': 'https://www.google.com/s2/favicons?domain=expedia.com&sz=32',
  'uber.com': 'https://www.google.com/s2/favicons?domain=uber.com&sz=32',
  'www.uber.com': 'https://www.google.com/s2/favicons?domain=uber.com&sz=32',
  'lyft.com': 'https://www.google.com/s2/favicons?domain=lyft.com&sz=32',
  'www.lyft.com': 'https://www.google.com/s2/favicons?domain=lyft.com&sz=32',

  // Entertainment & Media
  'netflix.com': 'https://www.google.com/s2/favicons?domain=netflix.com&sz=32',
  'www.netflix.com': 'https://www.google.com/s2/favicons?domain=netflix.com&sz=32',
  'hulu.com': 'https://www.google.com/s2/favicons?domain=hulu.com&sz=32',
  'www.hulu.com': 'https://www.google.com/s2/favicons?domain=hulu.com&sz=32',
  'disneyplus.com': 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=32',
  'www.disneyplus.com': 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=32',
  'primevideo.com': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=32',
  'www.primevideo.com': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=32',
  'crunchyroll.com': 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=32',
  'www.crunchyroll.com': 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=32',

  // Design & Creative
  'figma.com': 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
  'www.figma.com': 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
  'adobe.com': 'https://www.google.com/s2/favicons?domain=adobe.com&sz=32',
  'www.adobe.com': 'https://www.google.com/s2/favicons?domain=adobe.com&sz=32',
  'creativecloud.adobe.com': 'https://www.google.com/s2/favicons?domain=adobe.com&sz=32',
  'canva.com': 'https://www.google.com/s2/favicons?domain=canva.com&sz=32',
  'www.canva.com': 'https://www.google.com/s2/favicons?domain=canva.com&sz=32',
  'sketch.com': 'https://www.google.com/s2/favicons?domain=sketch.com&sz=32',
  'www.sketch.com': 'https://www.google.com/s2/favicons?domain=sketch.com&sz=32',
  'behance.net': 'https://www.google.com/s2/favicons?domain=behance.net&sz=32',
  'www.behance.net': 'https://www.google.com/s2/favicons?domain=behance.net&sz=32',
  'dribbble.com': 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32',
  'www.dribbble.com': 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32',

  // Development Tools
  'vercel.com': 'https://www.google.com/s2/favicons?domain=vercel.com&sz=32',
  'www.vercel.com': 'https://www.google.com/s2/favicons?domain=vercel.com&sz=32',
  'netlify.com': 'https://www.google.com/s2/favicons?domain=netlify.com&sz=32',
  'www.netlify.com': 'https://www.google.com/s2/favicons?domain=netlify.com&sz=32',
  'heroku.com': 'https://www.google.com/s2/favicons?domain=heroku.com&sz=32',
  'www.heroku.com': 'https://www.google.com/s2/favicons?domain=heroku.com&sz=32',
  'aws.amazon.com': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=32',
  'console.aws.amazon.com': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=32',
  'azure.microsoft.com': 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=32',
  'portal.azure.com': 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=32',
  'cloud.google.com': 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=32',
  'console.cloud.google.com': 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=32',
  'digitalocean.com': 'https://www.google.com/s2/favicons?domain=digitalocean.com&sz=32',
  'www.digitalocean.com': 'https://www.google.com/s2/favicons?domain=digitalocean.com&sz=32',

  // AI & Tools
  'openai.com': 'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
  'www.openai.com': 'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
  'chat.openai.com': 'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
  'anthropic.com': 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=32',
  'www.anthropic.com': 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=32',
  'claude.ai': 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
  'www.claude.ai': 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
  'huggingface.co': 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=32',
  'www.huggingface.co': 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=32',
  'midjourney.com': 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=32',
  'www.midjourney.com': 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=32',

  // News & Information
  'wikipedia.org': 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32',
  'www.wikipedia.org': 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32',
  'en.wikipedia.org': 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32',
  'bbc.com': 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32',
  'www.bbc.com': 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32',
  'cnn.com': 'https://www.google.com/s2/favicons?domain=cnn.com&sz=32',
  'www.cnn.com': 'https://www.google.com/s2/favicons?domain=cnn.com&sz=32',
  'techcrunch.com': 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32',
  'www.techcrunch.com': 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32',
  'theverge.com': 'https://www.google.com/s2/favicons?domain=theverge.com&sz=32',
  'www.theverge.com': 'https://www.google.com/s2/favicons?domain=theverge.com&sz=32',

  // Email Services
  'gmail.com': 'https://www.google.com/s2/favicons?domain=gmail.com&sz=32',
  'mail.google.com': 'https://www.google.com/s2/favicons?domain=gmail.com&sz=32',
  'outlook.com': 'https://www.google.com/s2/favicons?domain=outlook.com&sz=32',
  'www.outlook.com': 'https://www.google.com/s2/favicons?domain=outlook.com&sz=32',
  'yahoo.com': 'https://www.google.com/s2/favicons?domain=yahoo.com&sz=32',
  'mail.yahoo.com': 'https://www.google.com/s2/favicons?domain=yahoo.com&sz=32',
  'www.yahoo.com': 'https://www.google.com/s2/favicons?domain=yahoo.com&sz=32',
  'protonmail.com': 'https://www.google.com/s2/favicons?domain=protonmail.com&sz=32',
  'www.protonmail.com': 'https://www.google.com/s2/favicons?domain=protonmail.com&sz=32',

  // Dating Apps
  'tinder.com': 'https://www.google.com/s2/favicons?domain=tinder.com&sz=32',
  'www.tinder.com': 'https://www.google.com/s2/favicons?domain=tinder.com&sz=32',
  'bumble.com': 'https://www.google.com/s2/favicons?domain=bumble.com&sz=32',
  'www.bumble.com': 'https://www.google.com/s2/favicons?domain=bumble.com&sz=32',
  'match.com': 'https://www.google.com/s2/favicons?domain=match.com&sz=32',
  'www.match.com': 'https://www.google.com/s2/favicons?domain=match.com&sz=32',

  // Food Delivery
  'ubereats.com': 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=32',
  'www.ubereats.com': 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=32',
  'doordash.com': 'https://www.google.com/s2/favicons?domain=doordash.com&sz=32',
  'www.doordash.com': 'https://www.google.com/s2/favicons?domain=doordash.com&sz=32',
  'grubhub.com': 'https://www.google.com/s2/favicons?domain=grubhub.com&sz=32',
  'www.grubhub.com': 'https://www.google.com/s2/favicons?domain=grubhub.com&sz=32',

  // Alternative Services & Search Engines
  'google.com': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'www.google.com': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'bing.com': 'https://www.google.com/s2/favicons?domain=bing.com&sz=32',
  'www.bing.com': 'https://www.google.com/s2/favicons?domain=bing.com&sz=32',
  'duckduckgo.com': 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=32',
  'www.duckduckgo.com': 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=32',
  'brave.com': 'https://www.google.com/s2/favicons?domain=brave.com&sz=32',
  'www.brave.com': 'https://www.google.com/s2/favicons?domain=brave.com&sz=32',
  'firefox.com': 'https://www.google.com/s2/favicons?domain=firefox.com&sz=32',
  'www.firefox.com': 'https://www.google.com/s2/favicons?domain=firefox.com&sz=32',
  'mozilla.org': 'https://www.google.com/s2/favicons?domain=mozilla.org&sz=32',
  'www.mozilla.org': 'https://www.google.com/s2/favicons?domain=mozilla.org&sz=32',

  // Productivity Tools
  'todoist.com': 'https://www.google.com/s2/favicons?domain=todoist.com&sz=32',
  'www.todoist.com': 'https://www.google.com/s2/favicons?domain=todoist.com&sz=32',
  'evernote.com': 'https://www.google.com/s2/favicons?domain=evernote.com&sz=32',
  'www.evernote.com': 'https://www.google.com/s2/favicons?domain=evernote.com&sz=32',
  'obsidian.md': 'https://www.google.com/s2/favicons?domain=obsidian.md&sz=32',
  'www.obsidian.md': 'https://www.google.com/s2/favicons?domain=obsidian.md&sz=32',

  // International Domains
  'google.fr': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'google.de': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'google.es': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'google.it': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'google.co.uk': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  'google.ca': 'https://www.google.com/s2/favicons?domain=google.com&sz=32',

  // Fallback function for unknown domains
  'getIconForDomain': function(domain) {
    // Remove www. and protocol if present
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Check if we have a specific icon for this domain
    if (this[cleanDomain]) {
      return this[cleanDomain];
    }
    
    // Try common variations
    const variations = [
      cleanDomain,
      `www.${cleanDomain}`,
      cleanDomain.replace(/^www\./, ''),
      cleanDomain.split('.')[0] + '.com'
    ];
    
    for (const variation of variations) {
      if (this[variation]) {
        return this[variation];
      }
    }
    
    // Fallback to Google S2 favicon service
    return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=32`;
  }
};
  


export function getCompanyFromUrl(chosenData) {
  for (const url in baseUrlIcons) {
    if (chosenData === url) {
      const companyName = baseUrlIcons[url].match(/\/brands\/([^\/]+)\.svg$/);
      return companyName ? companyName[1] : null;
    }
  }
  return null;
}  