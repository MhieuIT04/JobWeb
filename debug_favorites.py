#!/usr/bin/env python3
"""
Debug favorites functionality
"""
import requests
import json

def debug_favorites():
    """Debug tại sao favorites không hoạt động"""
    print("❤️ DEBUGGING FAVORITES FUNCTIONALITY")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Test với tài khoản đã tạo
    test_credentials = {
        "email": "employer11new@test.com",
        "password": "12345678"
    }
    
    print("1. TESTING LOGIN:")
    try:
        # Login first
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json=test_credentials,
            timeout=30
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return
        
        login_data = login_response.json()
        access_token = login_data.get('access')
        user_info = login_data.get('user', {})
        
        print(f"   ✅ Login successful!")
        print(f"   👤 User: {user_info.get('email')} (ID: {user_info.get('id')})")
        print(f"   🔑 Token: {access_token[:30]}...")
        
        # Headers for authenticated requests
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return
    
    print(f"\n2. TESTING FAVORITES API:")
    
    # Test GET favorites
    try:
        favorites_response = requests.get(
            f"{base_url}/api/jobs/favorites/",
            headers=headers,
            timeout=15
        )
        
        print(f"   📋 GET Favorites Status: {favorites_response.status_code}")
        
        if favorites_response.status_code == 200:
            favorites_data = favorites_response.json()
            print(f"   ✅ Current favorites: {len(favorites_data)} items")
            
            if favorites_data:
                for fav in favorites_data[:3]:
                    print(f"      - Job ID: {fav.get('job', {}).get('id')}, Favorite ID: {fav.get('id')}")
            else:
                print(f"      (No favorites yet)")
                
        else:
            print(f"   ❌ GET Favorites failed")
            print(f"   Response: {favorites_response.text}")
            
    except Exception as e:
        print(f"   ❌ GET Favorites error: {e}")
    
    # Test GET jobs (to get a job ID for testing)
    print(f"\n3. GETTING SAMPLE JOB:")
    try:
        jobs_response = requests.get(
            f"{base_url}/api/jobs/",
            timeout=15
        )
        
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            
            # Get results array
            jobs_list = jobs_data.get('results', jobs_data) if isinstance(jobs_data, dict) else jobs_data
            
            if jobs_list and len(jobs_list) > 0:
                test_job = jobs_list[0]
                test_job_id = test_job.get('id')
                test_job_title = test_job.get('title', 'Unknown')
                
                print(f"   ✅ Found test job: ID {test_job_id} - {test_job_title[:50]}...")
                
                # Test POST favorite (add to favorites)
                print(f"\n4. TESTING ADD TO FAVORITES:")
                try:
                    add_favorite_response = requests.post(
                        f"{base_url}/api/jobs/favorites/",
                        json={"job_id": test_job_id},
                        headers=headers,
                        timeout=15
                    )
                    
                    print(f"   📝 POST Favorite Status: {add_favorite_response.status_code}")
                    
                    if add_favorite_response.status_code == 201:
                        favorite_data = add_favorite_response.json()
                        favorite_id = favorite_data.get('id')
                        
                        print(f"   ✅ Added to favorites!")
                        print(f"   ❤️ Favorite ID: {favorite_id}")
                        
                        # Test DELETE favorite (remove from favorites)
                        print(f"\n5. TESTING REMOVE FROM FAVORITES:")
                        try:
                            delete_response = requests.delete(
                                f"{base_url}/api/jobs/favorites/{favorite_id}/",
                                headers=headers,
                                timeout=15
                            )
                            
                            print(f"   🗑️ DELETE Favorite Status: {delete_response.status_code}")
                            
                            if delete_response.status_code in [200, 204]:
                                print(f"   ✅ Removed from favorites!")
                                print(f"   🎉 FAVORITES FUNCTIONALITY WORKS!")
                            else:
                                print(f"   ❌ Delete failed: {delete_response.text}")
                                
                        except Exception as e:
                            print(f"   ❌ Delete error: {e}")
                            
                    elif add_favorite_response.status_code == 400:
                        error_data = add_favorite_response.json()
                        print(f"   ⚠️ Already favorited or validation error: {error_data}")
                        
                    else:
                        print(f"   ❌ Add favorite failed: {add_favorite_response.status_code}")
                        print(f"   Response: {add_favorite_response.text}")
                        
                except Exception as e:
                    print(f"   ❌ Add favorite error: {e}")
                    
            else:
                print(f"   ❌ No jobs found to test with")
                
        else:
            print(f"   ❌ Failed to get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Get jobs error: {e}")
    
    print(f"\n📋 SUMMARY:")
    print(f"   - Login: ✅ Working")
    print(f"   - GET Favorites: Check above")
    print(f"   - POST Favorite: Check above") 
    print(f"   - DELETE Favorite: Check above")
    
    print(f"\n💡 IF FAVORITES NOT WORKING ON FRONTEND:")
    print(f"   1. Check browser console for errors")
    print(f"   2. Verify authentication token is being sent")
    print(f"   3. Check CORS settings")
    print(f"   4. Verify API endpoints match frontend calls")

if __name__ == "__main__":
    debug_favorites()