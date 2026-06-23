node -e "require('https').get('https://YOUR-ALB-DNS/health',r=>console.log(r.statusCode)).on('error',console.error)"
