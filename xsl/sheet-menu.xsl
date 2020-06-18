<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8" />

	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyzéèëêàçö'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZEEEEACO'" />

	<xsl:template match="/">
		<div class="searchnav">
			<input type="search" id="xslsearch" name="xslsearch" placeholder="zoek..." />
			<input type="submit" id="search" value="→" />
		</div>
		<xsl:apply-templates select="child::*[1]/child::*" />
	</xsl:template>

	<!-- AUTO: generate menu buttons in the sidebar -->
	<xsl:template match="child::*[1]/child::*">
		<a class="btn nav target" href="#~{name(.)}" id="{name(.)}">
			<h2>
				<xsl:value-of select="translate(name(.),'_', ' ')" />
			</h2>
		</a>
	</xsl:template>

	<!-- MANUAL override -->

</xsl:stylesheet>
