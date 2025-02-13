
A privacy-focused email security analysis tool that performs comprehensive threat detection and security assessment directly in your browser. Analyze email headers, authentication, URLs, and attachments with zero data transmission.

![Image](https://github.com/user-attachments/assets/4409007b-3e3a-4f78-9d05-02f8be9c9022)


## 🌟 Key Features

### 🔒 Privacy First
- **Zero Data Transmission**: All analysis performed locally in your browser
- **No Storage**: Email content and attachments are never stored
- **No Third Parties**: No external services or analytics
- **Session-Only**: All data cleared on page close

### 📧 Email Authentication Analysis
- **DKIM Verification**: Domain Keys Identified Mail validation
- **DMARC Analysis**: Domain-based Message Authentication reporting
- **SPF Checking**: Sender Policy Framework verification
- **Header Analysis**: Comprehensive email header inspection
- **Routing Analysis**: Email path and timing verification

### 🔍 Advanced URL Analysis
- **Reputation Checking**: URL reputation and risk assessment
- **Domain Analysis**: Domain age and registration verification
- **Pattern Detection**: Suspicious URL pattern recognition
- **Phishing Detection**: Common phishing URL identification
- **Real-time Analysis**: On-demand URL scanning

### 📎 Attachment Security
- **Risk Assessment**: File type and content risk analysis
- **Hash Verification**: MD5 and SHA1 hash calculation
- **Size Analysis**: File size risk evaluation
- **Content Type Analysis**: MIME type verification
- **Multi-file Analysis**: Combined risk assessment for multiple attachments

### 📊 Security Scoring System
- **Overall Security Score**: Comprehensive security rating
- **Component Scores**: Individual scores for:
  - Authentication (DKIM, DMARC, SPF)
  - Content Analysis
  - Attachment Risk
- **Detailed Breakdowns**: In-depth analysis of each component
- **Risk Indicators**: Clear visual indicators of security status

### 🎨 Theme Support
- **Dark**: Professional dark theme
- **Light**: Clean light theme
- **Cyberpunk**: High-contrast cyberpunk style
- **Ocean**: Calming blue-based theme
- **Forest**: Nature-inspired green theme
- **Mocha**: Warm coffee-toned theme

### 📧 Supported Email Formats
- `.eml` - Standard email format
- `.msg` - Microsoft Outlook messages
- `.mbox` - Unix mailbox format
- `.mbx` - Alternative mailbox format
- `.mbs` - Alternative mailbox format
- `.mht` - MIME HTML format
- `.mhtml` - MIME HTML format

## 🚀 Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm 6.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scuba-check.git

# Navigate to project directory
cd scuba-check

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Technical Details

### Security Analysis Components

#### Email Authentication
- DKIM signature verification
- DMARC policy checking
- SPF record validation
- Header integrity verification
- Received chain analysis

#### URL Analysis
- Domain reputation checking
- URL pattern analysis
- Phishing indicator detection
- Domain age verification
- SSL/TLS verification

#### Attachment Analysis
- File type risk assessment
- Content analysis
- Hash verification
- Size validation
- Combined risk evaluation

### Privacy Implementation
- Browser-based analysis
- No server communication
- Memory-only processing
- Session-based storage
- Automatic data clearing

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Created by n0rthw1ndz (devchaps@gmail.com)

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- Vite.js contributors
- All open-source contributors

## 📞 Support

For support, email devchaps@gmail.com or create an issue in the repository.
