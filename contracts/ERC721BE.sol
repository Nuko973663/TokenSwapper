// SPDX-License-Identifier: MIT
// Test token for TokenSwapper

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./utils/Base64.sol";

contract ERC721BE is ERC721PresetMinterPauserAutoId {
    using Strings for uint256;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721PresetMinterPauserAutoId(name, symbol, "") {
        
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory svg = getSVG(tokenId);
        bytes memory json = abi.encodePacked(
            '{"name": "', this.name() ,' #',
            Strings.toString(tokenId),
            '", "description": "Sample NFT", "image": "data:image/svg+xml;base64,',
            Base64.encode(bytes(svg)),
            '"}'
        );
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }

    function getSVG(uint256 tokenId) private view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">\
<style>text{fill:black;30px;font-family:serif;}</style>\
<rect width="100%" height="100%" fill="#ccddcc" />\
<text x="10%" y="30%" font-size="50px">', this.name(),
'</text>\
<text x="10%" y="60%" font-size="30px">#',
                    Strings.toString(tokenId),
                    "</text></svg>"
                )
            );
    }
}

