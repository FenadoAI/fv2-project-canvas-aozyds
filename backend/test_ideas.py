#!/usr/bin/env python3

import requests
import json

# Test the idea generator API endpoints
API_BASE = "http://localhost:8001/api"

def test_generate_idea():
    print("🔄 Testing idea generation...")
    response = requests.post(f"{API_BASE}/ideas/generate")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print("✅ Idea generated successfully!")
            print(f"   Text: {data['idea']['idea_text']}")
            print(f"   Topic: {data['idea']['topic']}")
            print(f"   Theme: {data['idea']['theme']}")
            print(f"   Share URL: {data['idea']['share_url']}")
            return data['idea']
        else:
            print(f"❌ API returned error: {data.get('error')}")
            return None
    else:
        print(f"❌ Request failed with status {response.status_code}")
        return None

def test_upvote_idea(idea_id):
    print(f"🔄 Testing upvote for idea {idea_id[:8]}...")
    response = requests.post(f"{API_BASE}/ideas/{idea_id}/upvote")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"✅ Idea upvoted! New count: {data['upvotes']}")
            return True
        else:
            print(f"❌ Upvote failed: {data.get('error')}")
            return False
    else:
        print(f"❌ Upvote request failed with status {response.status_code}")
        return False

def test_get_popular_ideas():
    print("🔄 Testing popular ideas retrieval...")
    response = requests.get(f"{API_BASE}/ideas/popular?limit=5")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"✅ Retrieved {len(data['ideas'])} popular ideas (total: {data['total']})")
            for i, idea in enumerate(data['ideas'], 1):
                print(f"   {i}. {idea['idea_text']} (upvotes: {idea['upvotes']})")
            return True
        else:
            print(f"❌ Failed to get popular ideas: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        return False

def test_get_recent_ideas():
    print("🔄 Testing recent ideas retrieval...")
    response = requests.get(f"{API_BASE}/ideas/recent?limit=5")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"✅ Retrieved {len(data['ideas'])} recent ideas (total: {data['total']})")
            for i, idea in enumerate(data['ideas'], 1):
                print(f"   {i}. {idea['idea_text']}")
            return True
        else:
            print(f"❌ Failed to get recent ideas: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        return False

def test_shared_idea(share_hash):
    print(f"🔄 Testing shared idea retrieval for {share_hash}...")
    response = requests.get(f"{API_BASE}/ideas/share/{share_hash}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print("✅ Shared idea retrieved successfully!")
            print(f"   Text: {data['idea']['idea_text']}")
            print(f"   Upvotes: {data['idea']['upvotes']}")
            return True
        else:
            print(f"❌ Failed to get shared idea: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        return False

def main():
    print("🚀 Testing Website Idea Generator API")
    print("="*50)

    # Test idea generation
    idea = test_generate_idea()
    if not idea:
        return

    print()

    # Test upvoting
    test_upvote_idea(idea['id'])
    print()

    # Test popular ideas
    test_get_popular_ideas()
    print()

    # Test recent ideas
    test_get_recent_ideas()
    print()

    # Test shared idea
    share_hash = idea['share_url'].split('/')[-1]
    test_shared_idea(share_hash)

    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main()