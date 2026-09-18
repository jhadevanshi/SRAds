import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to replace UI visible strings, but let's be careful not to break the code/API.
    # We will only replace specific phrases.
    
    replacements = [
        ("Create Campaign", "Launch Ad"),
        ("Active Campaigns", "Active Ads"),
        ("Ready for Campaigns", "Ready for Ads"),
        ("keep your campaigns running", "keep your ads running"),
        ("Check your active campaigns", "Check your active ads"),
        ("Estimated campaign cost", "Estimated ad cost"),
        ("Campaign Charge", "Ad Charge"),
        ("Campaign: ${item.campaign_name}", "Ad: ${item.campaign_name}"),
        ("Campaign: ${txn.campaign_name}", "Ad: ${txn.campaign_name}"),
        (">Campaign<", ">Ad<")
    ]
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('E:/SRAds/business-app/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file))

print("Done")
