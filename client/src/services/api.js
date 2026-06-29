import axios from 'axios';

/**
 * Configure Axios client instance with standard base URL.
 * Vite loads VITE_API_URL environment variable at build-time.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Before every outgoing API call, check if there's a token stored in localStorage.
 * If found, append it to the HTTP request's 'Authorization' header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor with AUTOMATIC OFFLINE DEMO SIMULATOR fallback:
 * If the backend is offline (network error / connection refused), Axios intercepts the failure
 * and responds with mock JSON payloads. This lets the developer preview and test every single feature
 * (login, registration, swiping cards, celebration modals, matches grid, settings) without a backend.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the backend server is offline (Network Error / No response received)
    const isOffline = !error.response;

    if (isOffline) {
      console.warn('⚠️ Devify API Server is offline! Intercepting request and returning simulated Demo Mode data.');
      
      const config = error.config;
      const url = config.url || '';
      const method = config.method ? config.method.toLowerCase() : 'get';

      // 1. Mock Authentication (Login / Register)
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        let name = 'John Doe';
        if (url.includes('/register') && config.data) {
          try {
            const parsed = JSON.parse(config.data);
            if (parsed.name) name = parsed.name;
          } catch (_) {}
        }
        
        return Promise.resolve({
          data: {
            token: 'simulated-jwt-token-xyz123',
            user: {
              id: 'mock-user-john',
              email: 'developer@example.com',
              name: name
            }
          }
        });
      }

      // 2. Mock Profile GET / PUT
      if (url.includes('/profile')) {
        if (method === 'get') {
          return Promise.resolve({
            data: {
              userId: 'mock-user-john',
              name: 'John Doe',
              email: 'developer@example.com',
              bio: 'Full-stack developer passionate about React and Node.js. Love clean code and interactive UIs.',
              githubUrl: 'https://github.com/johndoe',
              techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Bootstrap 5']
            }
          });
        }
        
        if (method === 'put') {
          try {
            const payload = JSON.parse(config.data);
            return Promise.resolve({
              data: {
                userId: 'mock-user-john',
                name: 'John Doe',
                email: 'developer@example.com',
                bio: payload.bio,
                githubUrl: payload.githubUrl,
                techStack: payload.techStack,
                updatedAt: new Date().toISOString()
              }
            });
          } catch (_) {
            return Promise.reject(error);
          }
        }
      }

      // 3. Mock Swipe /next profiles
      if (url.includes('/swipe/next')) {
        const mockDevs = [
          {
            userId: 'mock-dev-jane',
            name: 'Jane Smith',
            bio: 'Senior Backend Engineer. Specializing in Python, Django, PostgreSQL, and Docker. Love API optimizations.',
            githubUrl: 'https://github.com/janesmith',
            techStack: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS']
          },
          {
            userId: 'mock-dev-alex',
            name: 'Alex Johnson',
            bio: 'Creative Frontend Architect. React and UI design enthusiast. Let’s make beautiful animations!',
            githubUrl: 'https://github.com/alexj',
            techStack: ['React', 'TypeScript', 'Tailwind', 'Figma', 'Framer Motion']
          },
          {
            userId: 'mock-dev-sarah',
            name: 'Sarah Dev',
            bio: 'MERN stack mentor. Working with Node.js, Express, React, and MongoDB. Open to peer programming projects.',
            githubUrl: 'https://github.com/sarahdev',
            techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'GraphQL']
          }
        ];

        // Retrieve or cycle the index in localStorage
        const swipeIndex = parseInt(localStorage.getItem('swipeIndex') || '0', 10);
        if (swipeIndex >= mockDevs.length) {
          // If we reach the end, return empty profile state
          localStorage.setItem('swipeIndex', '0');
          return Promise.resolve({
            data: { message: "No more profiles available" }
          });
        }

        // Return current index card profile
        return Promise.resolve({
          data: mockDevs[swipeIndex]
        });
      }

      // 4. Mock Swipe Actions (Like / Pass)
      if (url.includes('/swipe')) {
        try {
          const payload = JSON.parse(config.data);
          const isLike = payload.action === 'like';
          
          // Increment swipe deck counter for next card load
          const currentIndex = parseInt(localStorage.getItem('swipeIndex') || '0', 10);
          localStorage.setItem('swipeIndex', (currentIndex + 1).toString());

          // For simulation, matching on 'like' triggers the Celebration Modal!
          return Promise.resolve({
            data: {
              action: payload.action,
              match: isLike,
              matchId: `mock-match-room-${payload.swipedUserId}`,
              matchedUser: {
                userId: payload.swipedUserId,
                name: payload.swipedUserId === 'mock-dev-jane' ? 'Jane Smith' : payload.swipedUserId === 'mock-dev-alex' ? 'Alex Johnson' : 'Sarah Dev',
                bio: 'Simulated developer match profile.',
                githubUrl: 'https://github.com/',
                techStack: ['React', 'CSS']
              }
            }
          });
        } catch (_) {
          return Promise.reject(error);
        }
      }

      // 5. Mock Matches List
      if (url.includes('/matches')) {
        return Promise.resolve({
          data: {
            matches: [
              {
                matchId: 'mock-match-room-mock-dev-jane',
                matchedUser: {
                  userId: 'mock-dev-jane',
                  name: 'Jane Smith',
                  bio: 'Senior Backend Engineer. Specializing in Python, Django, PostgreSQL, and Docker. Love API optimizations.',
                  githubUrl: 'https://github.com/janesmith',
                  techStack: ['Python', 'Django', 'PostgreSQL', 'Docker']
                },
                createdAt: new Date().toISOString()
              },
              {
                matchId: 'mock-match-room-mock-dev-alex',
                matchedUser: {
                  userId: 'mock-dev-alex',
                  name: 'Alex Johnson',
                  bio: 'Creative Frontend Architect. React and UI design enthusiast. Let’s make beautiful animations!',
                  githubUrl: 'https://github.com/alexj',
                  techStack: ['React', 'TypeScript', 'CSS', 'Figma']
                },
                createdAt: new Date().toISOString()
              }
            ]
          }
        });
      }

      // 6. Mock Messages Logs history
      if (url.includes('/messages/')) {
        const id = url.split('/messages/')[1];
        const partner = id.includes('jane') ? 'Jane Smith' : 'Alex Johnson';
        return Promise.resolve({
          data: {
            matchId: id,
            messages: [
              {
                messageId: 'msg-1',
                senderId: id.replace('mock-match-room-', ''),
                senderName: partner,
                content: `Hey! I saw you work with React. I'd love to pair program on some MERN dashboard features.`,
                timestamp: new Date(Date.now() - 3600000).toISOString()
              },
              {
                messageId: 'msg-2',
                senderId: 'mock-user-john',
                senderName: 'John Doe',
                content: `Hey ${partner}! That sounds like a plan. Let's arrange some code sprints.`,
                timestamp: new Date(Date.now() - 1800000).toISOString()
              }
            ]
          }
        });
      }
    }

    // Standard error interceptor logic for offline checks
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
