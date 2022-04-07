/*
 *******   Kartlı Yoklama Aktarıcısı   *******
 * Kartlı yoklama cihazı ile elde edilen
 * yoklama dosyalarının öğrenci otomasyonuna
 * birkaç tıklama ile aktarılabilmesini sağlar.
 *
 * http://huseyinatasoy.com/Kartli-Yoklama-Cihazi
 * http://huseyinatasoy.com/Kartli-Yoklama-Aktaricisi
 */

function uyari(m)
{
  var e=document.getElementById('bilgi');
  e.innerHTML=m;
  e.style.color='red';
}
function bilgi(m)
{
  var e=document.getElementById('bilgi');
  e.innerHTML=m;
  e.style.color='green';
}
function fGecersiz()
{
  uyari('Dosya geçerli formatta değil! İlk sütununda, yoklamada var yazılacak olan öğrencilerin numaralarını içeren bir csv dosyası seçmelisiniz.');
}

function dosyaSecildi(e)
{
  var dosyaE=e.target;
  var imzaNo=parseInt(dosyaE.getAttribute('data-i'));
  var dosyalar=dosyaE.files;
  if(!dosyalar.length)
  {
    uyari('Dosya seçmediniz!');
    return;
  }
  if(!dosyalar[0].name.toLowerCase().endsWith('.csv'))
  {
    fGecersiz();
    dosyaE.value=null;
    return;
  }
  bilgi('İşleniyor...');
  var okuyucu=new FileReader();
  okuyucu.onload=function()
  {
    var v=okuyucu.result;
    if(v.length<4 || isNaN(v.substr(0,4)))
    {
      fGecersiz();
      dosyaE.value=null;
      return;
    }
    var formatli='',i,j,satirlar=v.split(/[\r|\n]/);
    for(i=0;i<satirlar.length;i++)
    {
      var sutunlar=satirlar[i].split(/\;/);
      var siradaki=sutunlar[0].trim();
      if(siradaki=='') continue;
      formatli+="'"+sutunlar[0].trim()+"',";
    }
    if(formatli.endsWith(',')) formatli=formatli.substr(0,formatli.length-1);
    formatli='Array('+formatli+')';
    if(imzaNo>0)
      isaretle(formatli,imzaNo);
    else
    {
      for(var j=1;j<=imzaS;j++) isaretle(formatli,j);
    }
    dosyaE.disabled=true;
  };
  okuyucu.readAsText(dosyalar[0]);
}

var imzaS=0;
function imzaSayisi()
{
  var jsKod="function cbisaretle(dizi,sutunNo){ for(var i=1;i<trler.length;i++) { var isaretlenecek=(dizi.indexOf(trler[i].getElementsByTagName('td')[1].innerText.trim())>-1); var inputlar=trler[i].getElementsByTagName('input'); var k=0; for(var j=0;j<inputlar.length;j++) { if(inputlar[j].type=='checkbox') k++; if(k==sutunNo) { if(isaretlenecek) inputlar[j].checked=true; else inputlar[j].checked=false; } } } }";
  jsKod+="var tablo=null; try{tablo=document.getElementById('IFRAME1').contentWindow.document.getElementById('bailwal_overlay_frame').contentWindow.document.getElementById('grd');}catch(e){}";
  jsKod+="if(tablo!=null) { var trler=tablo.getElementsByTagName('tr'); var inputlar=trler[1].getElementsByTagName('input'); var j=0; for(var i=0;i<inputlar.length;i++) if(inputlar[i].type=='checkbox') j++; j }";
  chrome.tabs.executeScript({ code: jsKod }, function(snc) {
    imzaS=parseInt(snc);
    if(imzaS>0)
    {
      var icerik='<h2>Tümüne uygula:</h2> <input data-i="0" type="file" class="dosya" name="dosya"><hr>';
      for(var i=1;i<=imzaS;i++) icerik+='<h2>'+i+'. ders:</h2> <input data-i="'+i+'" type="file" class="dosya">';
      var d=document.getElementById('dosyalar');
      d.innerHTML=icerik;
      var inputlar=d.getElementsByTagName('input');
      for(var i=0;i<=imzaS;i++) inputlar[i].addEventListener('change', function(){ dosyaSecildi(event); }); // ilki tümü için
      bilgi('');
    }
    else
    {
      uyari('Giriş yaptıktan sonra yoklamaları girdiğiniz listeyi açmanız gerekiyor.');
    }
  });
}

function isaretle(strDizi,imzaNo)
{
  var jsKod="cbisaretle("+strDizi+","+imzaNo+")";
  chrome.tabs.executeScript({ code: jsKod }, function(snc)
  {
    bilgi('Başarılıyla aktarıldı. Otomasyondaki yoklama sayfası ile işiniz bittiğinde Kaydet butonu ile yoklama listesini kaydetmeyi unutmayın.');
  });
}

document.addEventListener('DOMContentLoaded', function()
{
  chrome.tabs.query({active:true,currentWindow:true}, function(sekmeler)
  {
    var url=sekmeler[0].url;
    var d=document.getElementById('dosyalar');
    if(!url.startsWith('https://obs.iste.edu.tr/oibs/akademik/'))
    {
      var d=document.getElementById('dosyalar');
      d.style.color='red';
      d.innerHTML='Otomasyonun yoklama sayfası açık değil! Yönlendirilmek için <a target="_blank" href="https://obs.iste.edu.tr/oibs/akademik/login.aspx">tıklayınız</a>.';
      return;
    }
    bilgi('Hazırlanıyor...');
    imzaSayisi();
    //test: isaretle("Array('100000000','100000001')");
  });
});
