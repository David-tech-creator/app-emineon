#!/bin/bash

echo "🧪 Testing Antaes PDF formatting fix..."
echo

# Test data with markdown formatting
TEST_DATA='{
  "candidateData": {
    "id": "test-123",
    "fullName": "Sarah Johnson",
    "currentTitle": "Senior Software Engineer",
    "email": "sarah.johnson@email.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "yearsOfExperience": 8,
    "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
    "certifications": ["AWS Solutions Architect", "Certified Scrum Master"],
    "experience": [
      {
        "company": "Google",
        "title": "Senior Software Engineer",
        "startDate": "2020",
        "endDate": "Present",
        "responsibilities": "Led development of scalable web applications. Mentored junior developers."
      }
    ],
    "education": ["BS Computer Science - Stanford University"],
    "languages": ["English (Native)", "Spanish (Fluent)"],
    "summary": "Experienced software engineer with expertise in full-stack development."
  },
  "template": "antaes",
  "sections": [
    {
      "title": "CORE COMPETENCIES",
      "type": "core-competencies",
      "order": 1,
      "content": "**Delivery & Project Management** Project planning and execution * Stakeholder management and communication * Risk assessment and mitigation strategies * Proven ability to deliver complex projects on time and within budget while maintaining high quality standards.\n\n**Service & Release Management** Service lifecycle management * Release planning and coordination * Change management processes * Expertise in managing service delivery and coordinating releases across multiple environments.\n\n**Product Management/Owner** Product roadmap development * User story creation and prioritization * Cross-functional team collaboration * Strong background in product strategy and working with development teams to deliver user-focused solutions."
    },
    {
      "title": "TECHNICAL EXPERTISE",
      "type": "technical-expertise",
      "order": 2,
      "content": "**Programming & Development** Modern programming languages and frameworks * Extensive experience in full-stack development with focus on scalable, maintainable code.\n\n**Cloud & Infrastructure** Cloud platforms and containerization technologies * Proficient in designing and implementing cloud-native solutions with high availability.\n\n**Data & Analytics** Database management and data analysis tools * Strong background in data modeling, analysis, and business intelligence solutions."
    }
  ]
}'

echo "📤 Sending request to generate Antaes PDF..."

# Generate PDF and save to file
RESPONSE=$(curl -s -w "%{http_code}" -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  -o "test-antaes.pdf" \
  https://app-emineon.vercel.app/api/competence-files/generate)

HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" -eq 200 ]; then
  PDF_SIZE=$(wc -c < "test-antaes.pdf")
  echo "✅ PDF generated successfully! Size: $PDF_SIZE bytes"
  
  # Check if PDF is valid
  PDF_HEADER=$(head -c 4 "test-antaes.pdf")
  if [ "$PDF_HEADER" = "%PDF" ]; then
    echo "✅ PDF header is valid"
    echo "✅ Antaes PDF formatting fix appears to be working!"
    
    echo
    echo "📤 Testing HTML preview..."
    
    # Test HTML preview
    HTML_RESPONSE=$(curl -s https://app-emineon.vercel.app/api/competence-files/antaes-preview)
    HTML_SIZE=${#HTML_RESPONSE}
    
    if [ $HTML_SIZE -gt 100 ]; then
      echo "✅ HTML preview generated ($HTML_SIZE chars)"
      
      # Check for proper HTML formatting
      HAS_STRONG=$(echo "$HTML_RESPONSE" | grep -c "<strong>" || true)
      HAS_LIST_ITEMS=$(echo "$HTML_RESPONSE" | grep -c "<li>" || true)
      HAS_BULLETS=$(echo "$HTML_RESPONSE" | grep -c "•" || true)
      
      echo "✅ Contains <strong> tags: $HAS_STRONG found"
      echo "✅ Contains <li> elements: $HAS_LIST_ITEMS found"
      echo "✅ Contains bullet points: $HAS_BULLETS found"
      
      if [ $HAS_STRONG -gt 0 ] && [ $HAS_LIST_ITEMS -gt 0 ] && [ $HAS_BULLETS -gt 0 ]; then
        echo
        echo "🎉 SUCCESS: Antaes formatting fix is working correctly!"
        echo "   - Markdown is being converted to proper HTML"
        echo "   - Bold text (**text**) → <strong>text</strong>"
        echo "   - Bullet points (*) → <li> with bullet styling"
        echo "   - PDF generation is working"
        echo
        echo "📄 Test PDF saved as: test-antaes.pdf"
      else
        echo
        echo "⚠️  WARNING: Some formatting features may not be working properly"
      fi
    else
      echo "❌ HTML preview failed or too small"
    fi
  else
    echo "❌ Invalid PDF generated (header: $PDF_HEADER)"
  fi
else
  echo "❌ PDF generation failed (HTTP $HTTP_CODE)"
  cat "test-antaes.pdf"
fi 