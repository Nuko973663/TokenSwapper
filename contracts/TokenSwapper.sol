// SPDX-License-Identifier: MIT
// TokenSwapper v0.1
// 新旧のERC721 NFTを交換する

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Context.sol";

interface IERC721Burnable is IERC721Enumerable {
    function burn(uint256 tokenId) external;
}

contract TokenSwapper is Context, ERC721Holder {
    IERC721Burnable private _nftOld;
    IERC721Burnable private _nftNew;
    address private _owner;
    bool private _burnAfterSwap;

    constructor(address addressOld_, address addressNew_, bool burnAfterSwap_) {
        _owner = _msgSender();
        _nftOld = IERC721Burnable(addressOld_);
        _nftNew = IERC721Burnable(addressNew_);
        _burnAfterSwap = burnAfterSwap_;
    }

    function isClaimable(address owner_) external view returns (bool){
        return _isClaimable(owner_);
    }

    function swap(uint256 _tokenId)  external {
        require(_isClaimable(_msgSender()),"Do not meet conditions to claim");
        _nftOld.safeTransferFrom(  _msgSender(), address(this), _tokenId);
        _nftNew.safeTransferFrom( address(this), _msgSender(), _tokenId);
        if(_burnAfterSwap){
            _nftOld.burn(_tokenId);
        }
    }

    function returnTokens(address addressReturn_) public {
        require(
            _owner == _msgSender(),
            "Must have admin role"
        );
        uint256 count;

        count = _nftNew.balanceOf(address(this));
        for(uint256 i = 0; i < count; i++){
            uint256 tokenId = _nftNew.tokenOfOwnerByIndex(address(this), i);
            _nftNew.safeTransferFrom( address(this), addressReturn_, tokenId);
        }

        count = _nftOld.balanceOf(address(this));
        for(uint256 i = 0; i < count; i++){
            uint256 tokenId = _nftOld.tokenOfOwnerByIndex(address(this), i);
            _nftOld.safeTransferFrom( address(this), addressReturn_, tokenId);
        }
    }
        
    function byebye(address payable owner_) external{
        require(
            _owner == _msgSender(),
            "Must have admin role"
        );
        returnTokens(owner_);
        selfdestruct(owner_);
    }

    function _isClaimable(address user_) private view returns (bool){ 
        return ( _nftOld.balanceOf(user_)>0 );
    }


}